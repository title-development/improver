package com.improver.service;

import com.improver.entity.*;
import com.improver.exception.*;
import com.improver.model.UserAccount;
import com.improver.model.admin.AdminContractor;
import com.improver.model.in.registration.StaffRegistration;
import com.improver.model.in.registration.UserRegistration;
import com.improver.model.in.*;
import com.improver.repository.*;
import com.improver.security.UserSecurityService;
import com.improver.util.mail.MailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

import static com.improver.model.in.CloseProjectRequest.Action.CANCEL;
import static com.improver.util.serializer.SerializationUtil.ERR_MSG_PASS_MINIMUM_REQUIREMENTS;
import static com.improver.util.serializer.SerializationUtil.PASS_PATTERN;


@Service
public class UserService {

    private final Logger log = LoggerFactory.getLogger(getClass());

    @Autowired private UserSecurityService userSecurityService;
    @Autowired private UserRepository userRepository;
    @Autowired private ContractorRepository contractorRepository;
    @Autowired private CustomerRepository customerRepository;
    @Autowired private MailService mailService;
    @Autowired private ImageService imageService;
    @Autowired
    private CustomerProjectService customerProjectService;
    @Autowired private ProjectRequestService projectRequestService;
    @Autowired private CompanyRepository companyRepository;


    public User getByEmail(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(NotFoundException::new);
    }

    public User getUserWithCheck(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(NotFoundException::new);
        if (user.isBlocked()) {
            throw new AccessDeniedException();
        }
        if (user.isDeleted()) {
            throw new NotFoundException("User has been deleted");
        }
        return user;
    }

    //TODO
    public void archiveUserById(long id) {
        User existed = userRepository.findById(id)
            .orElseThrow(NotFoundException::new);
        if(existed.getRole().equals(User.Role.ADMIN)) {
            throw new ValidationException("Admin can't be archived");
        }
        existed.setDeleted(true);
        userRepository.save(existed);
    }

    private void deleteAccount(User user) {
        imageService.silentDelete(user.getIconUrl());
        user.setDeleted(true)
            .setIconUrl(null)
            .setUpdated(ZonedDateTime.now());
        userRepository.save(user);
        mailService.sendDeletedAccount(user);
    }

    public void deleteCustomer(Customer customer) {
        customer.getProjects().forEach(project -> {
            if (project.getStatus().equals(Project.Status.IN_PROGRESS) ||
                project.getStatus().equals(Project.Status.ACTIVE) ||
                project.getStatus().equals(Project.Status.VALIDATION)) {
                customerProjectService.closeProject(project, new CloseProjectRequest(CANCEL, Project.Reason.OTHER, "Customer deleted account"));
            }
        });
        deleteAccount(customer);
    }

    public void deleteContractor(Contractor contractor) {
        contractor.getProjectRequests().forEach(projectRequest -> {
            if (ProjectRequest.Status.getActive().contains(projectRequest.getStatus()))
                projectRequestService.closeProject(projectRequest, ZonedDateTime.now(), true);
        });
        deleteAccount(contractor);

    }

    public void blockUser(Long id, boolean blocked) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new BadRequestException("Bad request"));
        user.setBlocked(blocked);
        mailService.sendBlockAccount(user);
        userRepository.save(user);
    }

    public void deleteContractors(List<Contractor> contractors) {
        contractors.forEach(this::deleteContractor);
    }


    public void updateUser(long id, User toUpdate) {
        User existed = userRepository.findById(id)
            .orElseThrow(NotFoundException::new);

        existed
            .setFirstName(toUpdate.getFirstName())
            .setLastName(toUpdate.getLastName())
            .setDisplayName(toUpdate.getDisplayName())
            .setEmail(toUpdate.getEmail())
            .setInternalPhone(toUpdate.getInternalPhone());

        userRepository.save(existed);
    }

    /**
     * Sends Registration Confirmation mail
     */
    public Contractor registerContractor(UserRegistration registration, Company company) {
        String validationKey = UUID.randomUUID().toString();

        String replyText = "Hi, we received your project request from Home Improve and would love to discuss this with you. " +
            "Please let us know a convenient time for you. " +
            "We look forward to connecting with you! Thanks, %s from %s!";
        replyText = String.format(replyText, registration.getFirstName() + " " + registration.getLastName(), company.getName());

        Contractor contractor = contractorRepository.save(new Contractor(registration)
            .setValidationKey(validationKey)
            .setCompany(company)
            .setReplyText(replyText)
            .setQuickReply(true)
        );
        mailService.sendRegistrationConfirmEmail(contractor);
        return contractor;
    }

    /**
     * Sends Registration Confirmation mail
     */
    public Customer registerCustomer(UserRegistration registration) {
        Customer customer = (Customer) saveNewUserRegistration(registration, User.Role.CUSTOMER);
        mailService.sendRegistrationConfirmEmail(customer);
        return customer;
    }


    public User saveNewUserRegistration(UserRegistration registration, User.Role role) {
        User registeredUser;
        String validationKey = UUID.randomUUID().toString();

        switch (role) {
            case CUSTOMER:
                registeredUser = customerRepository.save(new Customer(registration).setValidationKey(validationKey));
                break;
            default:
                throw new ValidationException(role + " Role is not supported");
        }
        return registeredUser;
    }



    public void updaterPassword(OldNewValue oldNewValue, User user) {
        if (!BCrypt.checkpw(oldNewValue.getOldValue(), user.getPassword())) {
            throw new ValidationException("Incorrect password");
        }
        if(!PASS_PATTERN.matcher(oldNewValue.getNewValue()).matches()) {
            throw new ValidationException(ERR_MSG_PASS_MINIMUM_REQUIREMENTS);
        }
        userRepository.updatePasswordFor(user.getEmail(), BCrypt.hashpw(oldNewValue.getNewValue(), BCrypt.gensalt()));
        mailService.sendPasswordUpdated(user);
    }


    /**
     * Updates iconUrl for user. Previous iconUrl removes form database
     */
    public void updateIcon(User user, String imageUrl) {
        String oldImageUrl = user.getIconUrl();
        if (oldImageUrl != null && !oldImageUrl.isEmpty()) {
            imageService.silentDelete(oldImageUrl);
        }
        userRepository.save(user.setIconUrl(imageUrl).setUpdated(ZonedDateTime.now()));
    }


    public User activateUser(UserActivation activation) {
        log.info(activation.toString());
        User user = userRepository.findByValidationKey(activation.getToken())
            .orElseThrow(() -> new ConflictException("Confirmation link is invalid"));
        if (user.isActivated()) {
            log.error("User {} validation key={} already activated", user.getEmail(), activation.getToken());
            // remove validationKey
            userRepository.save(user.setValidationKey(null));
            throw new ConflictException("Confirmation link is invalid");
        }

        user.setActivated(true);
        user.setValidationKey(null);
        if (activation.getPassword() != null) {
            log.info("Updating password for user={}", user.getEmail());
            user.setPassword(activation.getPassword());
        }
        user = userRepository.save(user);
        log.info("User confirmed email={}", user.getEmail());
        return user;
    }

    public User confirmUserEmail(UserActivation activation) {
        log.info(activation.toString());
        User user = userRepository.findByValidationKey(activation.getToken())
            .orElseThrow(() -> new ConflictException("Confirmation link is invalid"));
        user.setEmail(user.getNewEmail());
        user.setNewEmail(null);
        user.setValidationKey(null);
        user = userRepository.save(user);
        log.info("User confirmed email={}", user.getEmail());
        return user;
    }


    public boolean isEmailFree(String email) {
        return userRepository.isEmailFree(email);
    }


    public void updateEmail(long id, String email) {
        User user = userRepository.findById(id)
            .orElseThrow(NotFoundException::new);
        user.setNewEmail(email);
        user.setValidationKey(UUID.randomUUID().toString());
        userRepository.save(user);
        mailService.sendEmailChangedNotice(user);
        mailService.sendEmailChanged(user);
    }


    public boolean checkPassword(String password) {
        log.info("Checking password");
        User user = userSecurityService.currentUser();
        if (!BCrypt.checkpw(password, user.getPassword())) {
            throw new ValidationException("Incorrect password");
        }
        return true;
    }


    public void restorePasswordRequest(String email) {
        User user;
        try {
            user = getUserWithCheck(email);
        } catch (Exception e) {
            log.info("Could not reset password for {}. {}", email, e.getMessage());
            return;
        }

        user.setValidationKey(UUID.randomUUID().toString());
        userRepository.save(user);
        mailService.sendPasswordRestore(user);
    }

    public User restorePassword(UserActivation activation) {
        User user = userRepository.findByValidationKey(activation.getToken())
            .orElseThrow(() -> new ConflictException("Confirmation link is invalid"));
        user.setValidationKey(null);
        user.setPassword(activation.getPassword());
        user = userRepository.save(user);
        log.info("User={} restored password", user.getEmail());
        return user;
    }

    public void updateAccount(Long id, UserAccount account) {
        User existed = userRepository.findById(id)
            .orElseThrow(NotFoundException::new);

        existed.setFirstName(account.getFirstName())
            .setLastName(account.getLastName())
            .setDisplayName(account.getFirstName() + " " + account.getLastName())
            .setInternalPhone(account.getPhone())
            .setUpdated(ZonedDateTime.now());

        if (account.getIconUrl() != null && !account.getIconUrl().equals(existed.getIconUrl()) && !account.getIconUrl().isEmpty()) {
            String iconUrl = imageService.updateBase64Image(account.getIconUrl(), existed.getIconUrl());
            existed.setIconUrl(iconUrl);
        }
        userRepository.save(existed);
    }

    public Page<AdminContractor> getAllContractors(Long id, String displayName, String email, String companyName, Pageable pageable) {
        return userRepository.getAllContractors(id, displayName, email, companyName, pageable);
    }

    public Page<User> getAllCustomers(Long id, String displayName, String email, Pageable pageable) {
        return userRepository.getAllCustomers(id, displayName, email, pageable);
    }

    public void updateAdminUser(long id, User toUpdate) {
        User user = userRepository.findById(id)
            .orElseThrow(NotFoundException::new);

        user.setFirstName(toUpdate.getFirstName());
        user.setLastName(toUpdate.getLastName());
        user.setDisplayName(toUpdate.getDisplayName());
        user.setEmail(toUpdate.getEmail());
        user.setInternalPhone(toUpdate.getInternalPhone());
        user.setActivated(toUpdate.isActivated());
        user.setBlocked(toUpdate.isBlocked());
        userRepository.save(user);
    }


    public User findByRefreshId(String refreshToken) {
        return userRepository.findByRefreshId(refreshToken);
    }

    public void createStaffUser(StaffRegistration registration) throws BadRequestException {
        switch (registration.getRole()) {
            case SUPPORT:
                Support support = new Support(registration)
                    .setActivated(true)
                    .setCreated(ZonedDateTime.now());
                userRepository.save(support);
                break;
            case STAKEHOLDER:
                Stakeholder stakeholder = new Stakeholder(registration)
                    .setActivated(true)
                    .setCreated(ZonedDateTime.now());
                userRepository.save(stakeholder);
                break;
            case MANAGER:
                Manager manager = new Manager(registration)
                    .setActivated(true)
                    .setCreated(ZonedDateTime.now());
                userRepository.save(manager);
                break;
            default:
                throw new BadRequestException("Bad request");
        }
    }

    public void restoreCustomer(Customer customer) {
        restoreAccount(customer);
    }

    public void restoreContractor(Contractor contractor) {
        Company company = contractor.getCompany();
        company.setDeleted(false);
        companyRepository.save(company);
        restoreAccount(contractor);
    }

    public void restoreAccount(User user) {
        user.setDeleted(false);
        userRepository.save(user);
        mailService.sendRestoredAccount(user);
    }

}
