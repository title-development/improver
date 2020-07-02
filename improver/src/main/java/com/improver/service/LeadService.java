package com.improver.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.improver.entity.*;
import com.improver.exception.ConflictException;
import com.improver.exception.NotFoundException;
import com.improver.exception.PaymentFailureException;
import com.improver.exception.ValidationException;
import com.improver.model.in.Order;
import com.improver.model.out.project.Lead;
import com.improver.model.out.project.ShortLead;
import com.improver.repository.BillRepository;
import com.improver.repository.CompanyRepository;
import com.improver.repository.ProjectRepository;
import com.improver.repository.TransactionRepository;
import com.improver.util.mail.MailService;
import com.improver.util.serializer.SerializationUtil;
import com.stripe.model.Card;
import com.stripe.model.Charge;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static com.improver.application.properties.BusinessProperties.DEFAULT_SUBSCRIPTION_DISCOUNT;
import static com.improver.application.properties.BusinessProperties.SIMILAR_PROJECT_COUNT;
import static org.springframework.util.CollectionUtils.isEmpty;

@Slf4j
@Service
public class LeadService {

    @Autowired private ProjectRepository projectRepository;
    @Autowired private TransactionRepository transactionRepository;
    @Autowired private WsNotificationService wsNotificationService;
    @Autowired private ProjectRequestService projectRequestService;
    @Autowired private BillRepository billRepository;
    @Autowired private PaymentService paymentService;
    @Autowired private MailService mailService;
    @Autowired private CompanyRepository companyRepository;
    @Lazy @Autowired private LeadService self;  // Required for same instance Transactional method call


    /**
     * @param contractor target Contractor
     * @param eligibleForPurchase get only eligible for purchase leads
     * @param inCoverageOnly get leads only in Contractor service coverage
     * @param southWest coordinate of Bbox
     * @param northEast coordinate of Bbox
     */
    public Page<ShortLead> getLeads(Contractor contractor, boolean eligibleForPurchase, boolean inCoverageOnly, String searchTerm, double[] southWest, double[] northEast, Pageable pageable) {
        Page<ShortLead> leads;
        List<Project.Status> statuses = eligibleForPurchase ? Project.Status.forPurchase() : Project.Status.getActive();
        boolean withoutBBox = southWest == null || southWest.length == 0 || northEast == null || northEast.length == 0;
        if (inCoverageOnly || withoutBBox) {
            leads = projectRepository.getLeadsInCoverage(contractor.getCompany().getId(), statuses, searchTerm, pageable);
        } else {
            leads = projectRepository.getLeadsInCoverageAndBbox(contractor.getCompany().getId(), statuses, searchTerm, northEast[0], northEast[1], southWest[0], southWest[1], pageable);
        }
        return leads;
    }


    public void sendSubscriptionLead(Company company){
        Page<Project> page = getSuitableLeads(company, 1, company.getBilling().getSubscription().getReserve());
        if(page.getContent().isEmpty()){
            log.info("No Subscription Leads found for company id={}", company.getId());
        } else {
            subscriptionLeadPurchase(page.getContent().get(0), DEFAULT_SUBSCRIPTION_DISCOUNT, company);
        }
    }


    public Page<Project> getSuitableLeads(Company company, int count, int maxPrice) {
        return projectRepository.getSuitableLeads(company.getId(), Project.Status.forPurchase(), maxPrice,
            PageRequest.of(0, count, Sort.by(Sort.Direction.DESC, "created")));
    }


    public List<ShortLead> getSimilarLeads(long leadId, Contractor contractor) {
        Project project = projectRepository.findById(leadId)
            .orElse(null);
        Long projectId = Optional.ofNullable(project).map(Project::getId)
            .orElse(0L);

        /**
         * #1  All services in coverage
         */
        List<ShortLead> formCoverage = getLeads(contractor, true, true, null, null, null, null).stream()
            .filter(lead -> lead.getId() != projectId)
            .collect(Collectors.toList());
        if (formCoverage.size() <= SIMILAR_PROJECT_COUNT) {
            return formCoverage;
        }

        /**
         * #2 Same Service in coverage
         */
        if (project != null) {
            String serviceType = project.getServiceType().getName();
            List<ShortLead> sameServiceLeads = formCoverage.stream()
                .filter(lead -> serviceType.equalsIgnoreCase(lead.getServiceType()))
                .collect(Collectors.toList());

            if (sameServiceLeads.size() <= SIMILAR_PROJECT_COUNT) {
                return mergeSimilarLeads(sameServiceLeads, formCoverage);
            } else {
                return sameServiceLeads.stream()
                    .limit(SIMILAR_PROJECT_COUNT)
                    .collect(Collectors.toList());
            }
        }
        // If project is null
        else {
            return formCoverage.stream()
                .limit(SIMILAR_PROJECT_COUNT)
                .collect(Collectors.toList());
        }
    }


    public Lead getLead(long leadId, Company company) {
        Project project = projectRepository.getLeadNotPurchasedByCompany(leadId, company.getId())
            .orElseThrow(() -> new NotFoundException("Lead is not available"));
        return new Lead(project);
    }


    private void subscriptionLeadPurchase(Project lead, int discount, Company company) {
        Contractor assignment = company.getContractors().get(0);
        log.debug("Auto assigned contractor={} to lead={}", assignment.getEmail(), lead.getId());
        ProjectRequest projectRequest = purchaseLeadAndNotify(lead, discount, company, assignment, false, false);
        log.info("Lead id={} Subscription assignment. ProjectRequest id={}", lead.getId(), projectRequest.getId());
    }


    public long manualLeadPurchase(long leadId, Contractor contractor, boolean fromCard) {
        Company company = contractor.getCompany();
        Project lead = projectRepository.getLeadNotPurchasedByCompany(leadId, company.getId())
            .orElseThrow(() -> new NotFoundException("Lead is no longer available"));
        ProjectRequest projectRequest = purchaseLeadAndNotify(lead, 0, company, contractor, true, fromCard);
        log.info("Lead id={} purchased manually. ProjectRequest id={}", leadId, projectRequest.getId());
        return projectRequest.getId();
    }


    private ProjectRequest purchaseLeadAndNotify(Project lead, int discount, Company company, Contractor assignment, boolean isManual, boolean fromCard) {
        ProjectRequest projectRequest = self.purchaseLead(lead, discount, company, assignment, isManual, fromCard);
        wsNotificationService.updateBalance(company, company.getBilling());
        String serviceType = lead.getServiceName();
        wsNotificationService.newProjectRequest(lead.getCustomer(), company, serviceType, lead.getId());

        if (isManual) {
            mailService.sendManualLeadPurchaseEmail(assignment, projectRequest);
        } else {
            List <Order.QuestionAnswer> questionAnswers = SerializationUtil.fromJson(new TypeReference<>() {}, lead.getDetails());
            Order.BaseLeadInfo baseLeadInfo = new Order.BaseLeadInfo()
                .setStartExpectation(lead.getStartDate())
                .setNotes(lead.getNotes())
                .setStreetAddress(lead.getLocation().getStreetAddress())
                .setCity(lead.getLocation().getCity())
                .setState(lead.getLocation().getState())
                .setZip(lead.getLocation().getZip());
            mailService.sendLeadAutoPurchaseEmail(company, lead, projectRequest, baseLeadInfo, questionAnswers, true);
            wsNotificationService.newSubscriptionLeadPurchase(assignment, lead.getCustomer(), serviceType, projectRequest.getId());
        }
        mailService.sendNewProjectRequestEmail(company, lead);
        return projectRequest;
    }


    /**
     * This method NOT intended to be invoked directly!!!
     */
    @Transactional
    public ProjectRequest purchaseLead(Project lead, int discount, Company company, Contractor assignment, boolean isManual, boolean fromCard) {
        if (!lead.isLead()) {
            throw new ConflictException("Lead is no longer available");
        }
        if (assignment == null) {
            throw new IllegalArgumentException("Purchase should have a contractor assigned");
        }

        if (!isManual && fromCard) {
            throw new IllegalArgumentException("Automatic purchase not allowed from card");
        }
        if (discount < 0 || discount > 100) {
            throw new IllegalArgumentException("Illegal Discount value=" + discount);
        }

        int discountDelta = 0;
        if (discount > 0) {
            discountDelta = lead.getLeadPrice() * discount / 100;
        }
        int priceAfterDiscount = lead.getLeadPrice() - discountDelta;
        Billing bill = company.getBilling();
        String serviceType = lead.getServiceName();
        String chargeId = null;
        String paymentMethod = "Balance";
        if (fromCard) {
            log.debug("Performing Lead id={} purchase from card", lead.getId());
            Charge charge = chargeToCard(bill, priceAfterDiscount, serviceType);
            chargeId = charge.getId();
            Card card = (Card) charge.getSource();
            paymentMethod = card.getBrand() + " ending in " + card.getLast4();
        } else {
            log.debug("Performing Lead id={} purchase from balance", lead.getId());
            chargeToBalance(bill, priceAfterDiscount, isManual);
            billRepository.save(bill);
        }

        ProjectRequest projectRequest = projectRequestService.createProjectRequest(assignment, lead, priceAfterDiscount, isManual);
        transactionRepository.save(Transaction.purchase(company,
            serviceType,
            lead.getLocation(),
            projectRequest,
            priceAfterDiscount,
            paymentMethod,
            chargeId,
            isManual,
            bill.getBalance())
            .setDiscount(discountDelta)
        );
        return projectRequest;
    }


    @Async
    public void matchLeadWithSubscribers(Project lead) {
        List<Company> companies = getLastForSubs(lead, Project.SUBS_MAX_CONNECTIONS);
        if (companies.isEmpty()) {
            log.info("No subscribers found for Lead id={} ", lead.getId());
            return;
        }
        for (Company subscriber : companies) {
            log.info("Assign subscriber={} to lead={}", subscriber.getId(), lead.getId());
            try {
                subscriptionLeadPurchase(lead, DEFAULT_SUBSCRIPTION_DISCOUNT, subscriber);
            } catch (Exception e) {
                log.error("Couldn't assign subscriber={} to lead={}", subscriber.getId(), lead.getId());
            }
        }
    }


    private List<Company> getLastForSubs(Project project, int limit) {
        List<Company> eligibleForSubs = companyRepository.getEligibleForSubscriptionLead(
            project.getServiceType(), project.getLocation().getZip(), project.getLeadPrice(), LocalDate.now());
        if (eligibleForSubs.size() <= limit) {
            return eligibleForSubs;
        }
        List<Long> eligibleIds = eligibleForSubs.stream().map(Company::getId).collect(Collectors.toList());
        // TODO: fix in the future. Hibernate exception when converting to Company entity
        List<Long> ids = companyRepository.getLastSubsPurchased(eligibleIds, limit);
        return ids.stream()
            .map(id -> companyRepository.findById(id).get())
            .collect(Collectors.toList());
    }


    private Charge chargeToCard(Billing bill, int leadPrice, String serviceType) {
        if (bill.getStripeId() != null) {
            return paymentService.charge(bill.getStripeId(), leadPrice, serviceType + " lead purchase");
        } else {
            throw new PaymentFailureException("No payment method found. Add card to purchase.");
        }
    }

    private Billing chargeToBalance(Billing bill, int leadPrice, boolean isManual) {
        if (bill.getSubscription().isActive()) {
            int reserve = bill.getSubscription().getReserve();
            if (isManual) {
                if (bill.getBalance() - reserve >= leadPrice) {
                    bill.addToBalance(-leadPrice);
                } else {
                    throw new ValidationException("No enough money on balance to purchase this lead. "
                        + SerializationUtil.centsToUsd(reserve) + "$ on your balance is reserved for Subscription leads.");
                }
            } else {
                if (reserve >= leadPrice) {
                    bill.addToBalance(-leadPrice);
                    bill.getSubscription().setReserve(reserve - leadPrice);
                } else {
                    throw new ValidationException("No enough money on balance to purchase this lead. "
                        + SerializationUtil.centsToUsd(reserve) + "$ on your balance is reserved for Subscription leads.");
                }
            }
        } else {
            if (bill.getBalance() >= leadPrice) {
                bill.addToBalance(-leadPrice);
            } else {
                throw new ValidationException("Not enough money on balance to purchase this lead");
            }
        }
        return bill;
    }


    private List<ShortLead> mergeSimilarLeads(List<ShortLead> filtered, List<ShortLead> original) {
        if (isEmpty(filtered)) {
            return original.stream().limit(SIMILAR_PROJECT_COUNT).collect(Collectors.toList());
        }
        if (filtered.size() < SIMILAR_PROJECT_COUNT) {
            return Stream.concat(filtered.stream(), original.stream())
                .distinct()
                .limit(3)
                .collect(Collectors.toList());
        }
        if (filtered.size() <= SIMILAR_PROJECT_COUNT) {
            return filtered;
        }
        return Collections.emptyList();
    }


    public void putPendingOrdersToMarket(Customer customer) {
        List<Project> projects = projectRepository.findByCustomerIdAndIsLeadAndStatusIn(customer.getId(), false, Collections.singletonList(Project.Status.PENDING));
        projects.forEach(lead -> {
            lead.setLead(true)
                .setStatus(Project.Status.ACTIVE);
            projectRepository.save(lead);
            // will be executed in the same thread
            matchLeadWithSubscribers(lead);
        });
    }

}
