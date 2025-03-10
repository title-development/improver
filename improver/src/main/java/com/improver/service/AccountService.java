package com.improver.service;

import com.improver.entity.*;
import com.improver.exception.AccessDeniedException;
import com.improver.exception.ConflictException;
import com.improver.exception.NotFoundException;
import com.improver.exception.ValidationException;
import com.improver.model.UserAccount;
import com.improver.model.in.CloseProjectRequest;
import com.improver.model.in.EmailPasswordTuple;
import com.improver.model.in.UserActivation;
import com.improver.repository.ContractorRepository;
import com.improver.repository.CustomerRepository;
import com.improver.repository.UserRepository;
import com.improver.security.JwtUtil;
import com.improver.security.UserSecurityService;
import com.improver.util.mail.MailService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.time.ZonedDateTime;
import java.util.List;

import static com.improver.model.in.CloseProjectRequest.Action.CANCEL;


@Slf4j
@Service
public class AccountService {

    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private CompanyService companyService;
    @Autowired private MailService mailService;
    @Autowired private ImageService imageService;
    @Autowired private CustomerProjectService customerProjectService;
    @Autowired private ProjectRequestService projectRequestService;
    @Autowired private StaffActionLogger staffActionLogger;
    @Autowired private UserRepository userRepository;
    @Autowired private LeadService leadService;
    @Autowired private JwtUtil jwtUtil;
    @Autowired private CustomerRepository customerRepository;
    @Autowired private ContractorRepository contractorRepository;
    @Autowired private UserSecurityService userSecurityService;


    public void updateAccount(User existed, UserAccount account) {
        existed.setFirstName(account.getFirstName())
            .setLastName(account.getLastName())
            .setUpdated(ZonedDateTime.now());

        if (account.getIconUrl() != null && !account.getIconUrl().equals(existed.getIconUrl()) && !account.getIconUrl().isEmpty()) {
            String iconUrl = imageService.updateBase64Image(account.getIconUrl(), existed.getIconUrl());
            existed.setIconUrl(iconUrl);
        }
        userRepository.save(existed);
    }


    public void archiveAccountWithPassword(User user, String password) {
        if (user.isNativeUser() && !passwordEncoder.matches(password, user.getPassword())) {
            throw new ValidationException("Password is not valid");
        }
        archiveAccount(user, null);

    }

    public void archiveAccount(User user, Admin admin) {
        switch (user.getRole()){

            case CUSTOMER:
                archiveCustomer((Customer) user, admin);
                break;

            case CONTRACTOR:
                Company company = ((Contractor) user).getCompany();
                if (company != null) {
                    archiveEntireCompany(company, admin);
                } else {
                    archiveUserAccount(user, admin);
                }
                break;

            case SUPPORT:
            case MANAGER:
            case STAKEHOLDER:
                archiveUserAccount(user, admin);
                break;

            case ADMIN:
                throw new AccessDeniedException("Admin account cannot be deleted");

            default:
                throw new IllegalArgumentException("User " + user.getRole() + " not supported archive method");
        }

    }



    private void archiveCustomer(Customer customer, Admin currentAdmin) {
        customer.getProjects().forEach(project -> {
            if (project.getStatus().equals(Project.Status.IN_PROGRESS) ||
                project.getStatus().equals(Project.Status.ACTIVE) ||
                project.getStatus().equals(Project.Status.VALIDATION)) {
                customerProjectService.closeProject(project, new CloseProjectRequest(CANCEL, Project.Reason.OTHER, "Customer deleted account"));
            }
        });
        archiveUserAccount(customer, currentAdmin);
    }

    private void archiveEntireCompany(Company company, Admin currentAdmin) {
        companyService.archiveCompany(company);
        if (currentAdmin != null) {
            staffActionLogger.logCompanyDelete(currentAdmin, company);
        }
        List<Contractor> pros = company.getContractors();
        pros.forEach(pro -> archiveContractor(pro, currentAdmin));
    }


    private void archiveContractor(Contractor contractor, Admin currentAdmin) {
        contractor.getProjectRequests().forEach(projectRequest -> {
            if (ProjectRequest.Status.getActive().contains(projectRequest.getStatus()))
                projectRequestService.closeProject(projectRequest, ZonedDateTime.now(), true);
        });
        archiveUserAccount(contractor, currentAdmin);

    }


    private void archiveUserAccount(User user, Admin currentAdmin) {
        imageService.silentDelete(user.getIconUrl());
        user.setDeleted(true)
            .setIconUrl(null)
            .setUpdated(ZonedDateTime.now());
        userRepository.save(user);
        mailService.sendDeletedAccount(user);
        if (currentAdmin != null) {
            staffActionLogger.logAccountDelete(currentAdmin, user);
        }
    }


    public void resetPasswordRequest(String email) {
        User user;
        try {
            user = userSecurityService.getUserWithCheck(email.toLowerCase());
        } catch (Exception e) {
            log.info("Could not reset password for {}. {}", email.toLowerCase(), e.getMessage());
            return;
        }

        user.generateValidationKey();
        userRepository.save(user);
        mailService.sendPasswordRestore(user);
    }


    public User activateUser(UserActivation activation) {
        String validationKey = jwtUtil.parseActivationJWT(activation.getToken());
        User user = userRepository.findByValidationKey(validationKey)
            .orElseThrow(() -> new ConflictException("Confirmation link is invalid"));
        if (user.isActivated()) {
            log.error("User {} validation key={} already activated", user.getEmail(), validationKey);
            // remove validationKey
            userRepository.save(user.setValidationKey(null));
            throw new ConflictException("Confirmation link is invalid");
        }
        user.setValidationKey(null);
        if (activation.getPassword() != null) {
            log.debug("Creating password for user={}", user.getEmail());
            user.setPassword(activation.getPassword());
        }
        activateAndSaveUser(user);
        log.info("User confirmed email={}", user.getEmail());
        return user;
    }

    @Transactional
    public User confirmUserEmailChange(UserActivation activation) {
        String validationKey = jwtUtil.parseActivationJWT(activation.getToken());
        User user = userRepository.findByValidationKey(validationKey)
            .orElseThrow(() -> new ConflictException("Confirmation link is invalid"));

        user.setEmail(user.getNewEmail());
        user.setNewEmail(null);
        user.setValidationKey(null);
        activateAndSaveUser(user);
        log.info("User confirmed email change={}", user.getEmail());
        return user;
    }


    @Transactional
    public User resetPassword(UserActivation activation) {
        String validationKey = jwtUtil.parseActivationJWT(activation.getToken());
        User user = userRepository.findByValidationKey(validationKey)
            .orElseThrow(() -> new ConflictException("Confirmation link is invalid"));
        user.setValidationKey(null);
        user.setPassword(activation.getPassword());
        activateAndSaveUser(user);
        log.info("User={} restored password", user.getEmail());
        return user;
    }

    private void activateAndSaveUser(User user) {
        boolean activated = false;
        if (!user.isActivated()){
            user.setActivated(true);
            activated = true;
        }
        user = userRepository.save(user);
        if (activated && user instanceof Customer){
            leadService.putPendingOrdersToMarket((Customer) user);
        }
    }

    @Transactional
    public void updateEmail(User user, EmailPasswordTuple emailPasswordTuple) {
        log.debug("Update email for " + emailPasswordTuple.getEmail());
        if (user.isNativeUser()) {
            if (!BCrypt.checkpw(emailPasswordTuple.getPassword(), user.getPassword())) {
                throw new ValidationException("Incorrect password");
            }
        }
        user.setNewEmail(emailPasswordTuple.getEmail());
        user.generateValidationKey();
        userRepository.save(user);
        mailService.sendEmailChangedNotice(user);
        mailService.sendEmailChanged(user);
    }

    @Transactional
    public void updatePhoneNumber(User user, String phoneNumber) {
        log.debug("Update phone number for " + user.getEmail());
        user.setInternalPhone(phoneNumber);
        userRepository.save(user);
    }

    public void updateCustomerNotificationSettings(Customer customer, Customer.NotificationSettings settings) {
        if(!settings.isReceiveNewProjectRequestsEmail() && !settings.isReceiveNewProjectRequestsSms()) {
            throw new ValidationException("One of the notification types about new project request should be turned on");
        }
        customerRepository.save(customer.setNotificationSettings(settings));
    }

    public void updateContractorNotificationSettings(Contractor contractor, Contractor.NotificationSettings settings) {
        contractorRepository.save(contractor.setNotificationSettings(settings));
    }

}
