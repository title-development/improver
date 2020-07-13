package com.improver.service;

import com.improver.entity.*;
import com.improver.exception.*;
import com.improver.model.in.OldNewValue;
import com.improver.model.in.Order;
import com.improver.model.in.registration.CompanyDetails;
import com.improver.model.in.registration.CompanyRegistration;
import com.improver.model.in.registration.UserRegistration;
import com.improver.model.socials.SocialUser;
import com.improver.repository.*;
import com.improver.util.mail.MailService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.time.ZonedDateTime;

import static com.improver.util.TextMessages.REPLY_TEXT_TEMPLATE;

@Slf4j
@Service
public class RegistrationService {

    @Autowired private ContractorRepository contractorRepository;
    @Autowired private CustomerRepository customerRepository;
    @Autowired private SocialConnectionRepository socialConnectionRepository;
    @Autowired private CompanyConfigRepository companyConfigRepository;
    @Autowired private BillingService billingService;
    @Autowired private MailService mailService;
    @Autowired private CompanyConfigService companyConfigService;
    @Autowired private CompanyRepository companyRepository;
    @Autowired private ImageService imageService;
    @Autowired private BillRepository billRepository;
    @Autowired private UserRepository userRepository;


    /**
     * Sends Registration Confirmation mail
     */
    public Customer registerCustomer(UserRegistration registration) {
        Customer customer = customerRepository.save(new Customer(registration).generateValidationKey());
        if(!registration.isPreventConfirmationEmail()) {
            mailService.sendRegistrationConfirmEmail(customer);
        }
        return customer;
    }


    /**
     * Used during service order to create new Customer
     */
    public Customer autoRegisterCustomer(Order.BaseLeadInfo baseLeadInfo) {
        UserRegistration registration = new UserRegistration()
            .setEmail(baseLeadInfo.getEmail())
            .setFirstName(baseLeadInfo.getFirstName())
            .setLastName(baseLeadInfo.getLastName())
            .setPhone(baseLeadInfo.getPhone());
        return customerRepository.save(new Customer(registration).generateValidationKey());
    }


    /**
     * Saves new Contractor
     * NOTE. Mail will be sent during company registration
     */
    public Contractor registerContractor(UserRegistration registration) {
        return contractorRepository.save(new Contractor(registration)
            .setReferredBy(registration.getReferralCode())
            .generateValidationKey()
            .setIncomplete(true)
        );
    }


    /**
     * Register user by SocialConnections
     * @param user
     * @param socialUser
     * @return user
     */
    public User registerSocialUser(User user, SocialUser socialUser, boolean emailVerificationRequired, boolean preventConfirmationEmail) {
        SocialConnection socialConnection = new SocialConnection(socialUser, user);
        user.addSocialConnection(socialConnection);
        if (emailVerificationRequired) {
            user.generateValidationKey();
            user.setActivated(false);
        }

        if (user instanceof Contractor) {
            // sent email verification during company registration, if required
            contractorRepository.save((Contractor) user);
        } else if (user instanceof Customer) {
            customerRepository.save((Customer) user);
            if (emailVerificationRequired && !preventConfirmationEmail) {
                mailService.sendRegistrationConfirmEmail(user);
            }
        } else {
            throw new BadRequestException("Does not support user " + user.getClass());
        }
        socialConnectionRepository.save(socialConnection);
        return user;
    }


    /**
     * Performs registration of given company and links to given contractor
     *
     * @param registration registration data for company
     * @param contractor   company owner
     */
    @Transactional
    public void registerCompany(CompanyRegistration registration, Contractor contractor) {
        if (contractor.getCompany() != null) {
            throw new ConflictException(contractor.getCompany().getName() + " company already registered for "
                + contractor.getEmail());
        }

        Company company = createCompany(registration.getCompany());
        linkCompanyAndContractor(company, contractor);
        companyConfigService.updateTradesServicesCollection(company, registration.getTradesAndServices());
        CompanyConfig.CoverageConfig coverageConfig = company.getCompanyConfig().getCoverageConfig();
        coverageConfig.setCenterLat(registration.getCoverage().getCenter().lat)
            .setCenterLng(registration.getCoverage().getCenter().lng)
            .setRadius(registration.getCoverage().getRadius());
        companyConfigService.initCompanyCoverage(coverageConfig, company, contractor);

        // Add initial bonus from Invitation
        billingService.addInitialBonus(company, contractor.getEmail());
        // if user from facebook and require email confirm
        if (contractor.isNativeUser() || !contractor.isActivated()) {
            mailService.sendRegistrationConfirmEmail(contractor);
        }
    }


    private Company createCompany(CompanyDetails companyDetails) {
        ZonedDateTime now = ZonedDateTime.now();
        String iconUrl = null;
        if (companyDetails.getLogo() != null && !companyDetails.getLogo().isEmpty()) {
            try {
                iconUrl = imageService.saveBase64Image(companyDetails.getLogo());
            } catch (ValidationException | InternalServerException e) {
                log.error("Could not save company logo", e);
            }
        }

        Company company = companyRepository.save(Company.of(companyDetails, iconUrl, now));
        Billing billing = billRepository.save(Billing.forNewCompany(company));
        CompanyConfig defaultSettings = CompanyConfig.defaultSettings(company);
        company.setCompanyConfig(defaultSettings);
        company.setBilling(billing);
        companyConfigRepository.save(defaultSettings);
        return company;
    }


    private void linkCompanyAndContractor(Company company, Contractor contractor) {
        String replyText = String.format(REPLY_TEXT_TEMPLATE, contractor.getDisplayName(), company.getName());
        contractorRepository.save(contractor.setCompany(company)
            .setIncomplete(false)
            .setQuickReply(true)
            .setReplyText(replyText));
    }


    public void changeRegistrationEmail(OldNewValue oldNewEmail) {
        oldNewEmail.setNewValue(oldNewEmail.getNewValue().toLowerCase());
        oldNewEmail.setOldValue(oldNewEmail.getOldValue().toLowerCase());
        if (oldNewEmail.getOldValue().equals(oldNewEmail.getNewValue())) {
            throw new ValidationException("Email must be different");
        }

        User user = userRepository.findByEmail(oldNewEmail.getOldValue())
            .orElseThrow(() -> new ConflictException("Account doesn't exist for " + oldNewEmail.getNewValue()));
        if (user.isActivated()) {
            log.error("Cannot change registration email. User {} already activated!", user.getEmail());
            throw new ValidationException("Cannot change registration email. Email already confirmed!");
        }
        // regenerate validation key, so the old confirmation links became invalid
        User updated = userRepository.save(user.generateValidationKey().setEmail(oldNewEmail.getNewValue()));
        log.info("Changed registration email from " + oldNewEmail.getOldValue() + " to " + oldNewEmail.getNewValue());
        mailService.sendRegistrationConfirmEmail(updated);
    }



    public void resendRegistrationConfirmationEmail(String email, Long userId) {
        User user = null;
        if(email != null && !email.isEmpty()) {
            user = userRepository.findByEmail(email.toLowerCase())
                .orElseThrow(NotFoundException::new);
        }
        if(userId != null) {
            user = userRepository.findById(userId)
                .orElseThrow(NotFoundException::new);
        }
        if (user.isActivated() || user.getValidationKey() == null) {
            throw new ConflictException("Cannot resend confirmation mail. Email already confirmed!");
        }
        log.info("Resend Registration confirmation email for email=" + email + " id=");
        mailService.sendRegistrationConfirmEmail(user);
    }



}
