package com.improver.service;

import com.improver.entity.*;
import com.improver.exception.ConflictException;
import com.improver.exception.NotFoundException;
import com.improver.exception.PaymentFailureException;
import com.improver.exception.ValidationException;
import com.improver.model.out.project.Lead;
import com.improver.model.out.project.ShortLead;
import com.improver.repository.*;
import com.improver.util.serializer.SerializationUtil;
import com.improver.util.mail.MailService;
import com.improver.ws.WsNotificationService;
import com.stripe.model.Card;
import com.stripe.model.Charge;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.LockModeType;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static org.springframework.util.CollectionUtils.isEmpty;
import static org.springframework.util.CollectionUtils.lastElement;

@Service
public class LeadService {

    private final Logger log = LoggerFactory.getLogger(getClass());
    private final static int SIMILAR_PROJECT_COUNT = 3;

    @Autowired private ProjectRepository projectRepository;
    @Autowired private TransactionRepository transactionRepository;
    @Autowired
    private WsNotificationService wsNotificationService;
    @Autowired private ProjectRequestService projectRequestService;
    @Autowired private BillRepository billRepository;
    @Autowired private PaymentService paymentService;
    @Autowired private MailService mailService;
    @Autowired private ContractorRepository contractorRepository;
    @Autowired private CompanyRepository companyRepository;
    // Required for same instance Transactional method call
    @Lazy
    @Autowired private LeadService self;

    /**
     * @param zipCodesToInclude - additional zipCodes to include, may cross over with company coverage.
     */
    public Page<ShortLead> getLeads(Contractor contractor, List<String> zipCodesToInclude, boolean includeCoverage, boolean eligibleForPurchase, Pageable pageable) {
        Page<ShortLead> leads;
        List<Project.Status> statuses = eligibleForPurchase ? Project.Status.forPurchase() : Arrays.asList(Project.Status.values());
        if (includeCoverage) {
            if (isEmpty(zipCodesToInclude)) {
                leads = projectRepository.getLeadsInCoverage(contractor.getCompany().getId(), statuses, pageable);
            } else {
                leads = projectRepository.getLeadsInZipCodesAndCoverage(contractor.getCompany().getId(), zipCodesToInclude, statuses, pageable);
            }
        } else {
            leads = projectRepository.getLeadsExcludingCompanyCoverage(contractor.getCompany().getId(), zipCodesToInclude, statuses, pageable);
        }
        return leads;
    }


    public Page<Project> getSuitableLeads(Company company, int count, int maxPrice) {
        return projectRepository.getSuitableLeads(company.getId(), Project.Status.forPurchase(), maxPrice, PageRequest.of(0, count, Sort.by(Sort.Direction.DESC, "created")));
    }

    /**
     *
     */
    public List<ShortLead> getSimilarLeads(long leadId, Contractor contractor) {
        Project project = projectRepository.findById(leadId)
            .orElse(null);
        Long projectId = Optional.ofNullable(project).map(Project::getId)
            .orElse(0L);

        /**
         * #1  All services in coverage
         */
        List<ShortLead> formCoverage = getLeads(contractor, Collections.emptyList(), true, true, null).stream()
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


    public void subscriptionLeadPurchase(Project lead, int discount, Company company) {
        Contractor assignment = company.getContractors().get(0);
        log.info("Auto assigned contractor={} to lead={}", assignment.getEmail(), lead.getId());
        purchaseLeadAndNotify(lead, discount, company, assignment, false, false);
    }


    @Transactional
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    public long manualLeadPurchase(long leadId, Contractor contractor, boolean fromCard) {
        Company company = contractor.getCompany();
        Project lead = projectRepository.getLeadNotPurchasedByCompany(leadId, company.getId())
            .orElseThrow(() -> new NotFoundException("Lead is no longer available"));
        ProjectRequest projectRequest = purchaseLeadAndNotify(lead, 0, company, contractor, true, fromCard);
        return projectRequest.getId();
    }

    private ProjectRequest purchaseLeadAndNotify(Project lead, int discount, Company company, Contractor assignment, boolean isManual, boolean fromCard) {
        ProjectRequest projectRequest = self.purchaseLead(lead, discount, company, assignment, isManual, fromCard);

        String serviceType = lead.getServiceType().getName();
        wsNotificationService.newProjectRequest(lead.getCustomer(), company, serviceType, lead.getId());

        if (isManual) {
            mailService.sendManualLeadPurchaseEmail(assignment, projectRequest);
        } else {
            mailService.sendLeadAutoPurchaseEmail(company, projectRequest);
            wsNotificationService.newSubscriptionLeadPurchase(assignment, lead.getCustomer(), serviceType, projectRequest.getId());
        }
        mailService.sendNewProposalEmail(company, lead);
        return projectRequest;
    }


    /**
     * This method NOT intended to be invoked directly!!!
     */
    //@Transactional
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
        if (discount < 0 || discount > lead.getLeadPrice()) {
            throw new IllegalArgumentException("Illegal Discount value=" + discount);
        }

        String paymentMethod = "Balance";
        int leadPrice = lead.getLeadPrice() - discount;
        Billing bill = company.getBilling();
        String serviceType = lead.getServiceType().getName();
        String chargeId = null;
        if (fromCard) {
            Charge charge = chargeToCard(bill, leadPrice, serviceType);
            chargeId = charge.getId();
            Card card = (Card) charge.getSource();
            paymentMethod = card.getBrand() + " ending in " + card.getLast4();
        } else {
            chargeToBalance(bill, leadPrice, isManual);
            billRepository.save(bill);
        }
        ProjectRequest projectRequest = projectRequestService.createProjectRequest(assignment, lead, leadPrice, isManual);
        logLeadPurchaseTransaction(company, lead, projectRequest, leadPrice, paymentMethod, bill.getBalance(), isManual, chargeId);
        return projectRequest;
    }


    @Async
    public void matchLeadWithSubscribers(Project lead) {
        List<Company> companies = getLastForSubs(lead, Project.SUBS_MAX_CONNECTIONS);
        for (Company subscriber : companies) {
            log.info("Assign subscriber={} to lead={}", subscriber.getId(), lead.getId());
            try {
                subscriptionLeadPurchase(lead, 0, subscriber);
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

        return contractorRepository.getLastSubsPurchased(eligibleForSubs, PageRequest.of(0, limit));
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


    @Deprecated
    private void logLeadPurchaseTransaction(Company company, Project lead, ProjectRequest projectRequest, int price, String paymentMethod, int balance, boolean isManualLead, String chargeId) {
        Billing billing = company.getBilling();
        String serviceType = lead.getServiceType().getName();

        transactionRepository.save(Transaction.purchase(company,
            serviceType,
            lead.getLocation(),
            projectRequest,
            price,
            paymentMethod,
            chargeId,
            isManualLead,
            balance)
        );
        wsNotificationService.updateBalance(company, billing);
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

}
