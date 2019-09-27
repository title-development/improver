package com.improver.service;

import com.improver.entity.*;
import com.improver.exception.*;
import com.improver.model.UserAccount;
import com.improver.model.admin.AdminContractor;
import com.improver.model.in.OldNewValue;
import com.improver.model.in.UserActivation;
import com.improver.model.in.registration.StaffRegistration;
import com.improver.model.in.registration.UserRegistration;
import com.improver.model.socials.SocialUser;
import com.improver.repository.*;
import com.improver.security.UserSecurityService;
import com.improver.util.StaffActionLogger;
import com.improver.util.mail.MailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;
import java.util.UUID;

import static com.improver.util.ErrorMessages.ERR_MSG_PASS_MINIMUM_REQUIREMENTS;
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
    @Autowired private CompanyRepository companyRepository;
    @Autowired private StaffRepository staffRepository;
    @Autowired private SocialConnectionRepository socialConnectionRepository;
    @Autowired private StaffActionLogger staffActionLogger;


    public User getByEmail(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(NotFoundException::new);
    }

    //TODO: userSecurityService
    @Deprecated
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


    public void changeUserBlockedStatus(Long id, boolean blocked, Admin currentAdmin) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new BadRequestException("Bad request"));
        user.setBlocked(blocked);
        mailService.sendBlockAccount(user);
        userRepository.save(user);
        staffActionLogger.logChangeAccountBlockingStatus(currentAdmin, user);
    }


    public void updateUser(long id, User toUpdate, Admin currentAdmin) {
        User existed = userRepository.findById(id)
            .orElseThrow(NotFoundException::new);

        existed
            .setFirstName(toUpdate.getFirstName())
            .setLastName(toUpdate.getLastName())
            .setEmail(toUpdate.getEmail())
            .setInternalPhone(toUpdate.getInternalPhone());

        userRepository.save(existed);
        if (currentAdmin != null) {
            staffActionLogger.logAccountUpdate(currentAdmin, existed);
        }
    }

    /**
     * Saves new Contractor
     * NOTE. Mail will be sent during company registration
     */
    public Contractor registerContractor(UserRegistration registration) {
        String validationKey = UUID.randomUUID().toString();
        Contractor contractor = contractorRepository.save(new Contractor(registration)
            .setReferredBy(registration.getReferralCode())
            .setValidationKey(validationKey)
            .setIncomplete(true)
        );

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

    /**
     * Register user by SocialConnections
     * @param user
     * @param socialUser
     * @return user
     */
    public User registerUser(User user, SocialUser socialUser) {
        SocialConnection socialConnection = new SocialConnection(socialUser, user);
        user.addSocialConnection(socialConnection);
        if (user instanceof Contractor) {
            contractorRepository.save((Contractor) user);
        } else if (user instanceof Customer) {
            customerRepository.save((Customer) user);
        } else {
            throw new BadRequestException("Does not support user " + user.getClass());
        }
        socialConnectionRepository.save(socialConnection);

        return user;
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


    @Deprecated
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
            .setInternalPhone(account.getPhone())
            .setUpdated(ZonedDateTime.now());

        if (account.getIconUrl() != null && !account.getIconUrl().equals(existed.getIconUrl()) && !account.getIconUrl().isEmpty()) {
            String iconUrl = imageService.updateBase64Image(account.getIconUrl(), existed.getIconUrl());
            existed.setIconUrl(iconUrl);
        }
        userRepository.save(existed);
    }

    public User resendConfirmationEmail(String email, Long userId) {
        User user = null;
        if(email != null && !email.isEmpty()) {
            user = getByEmail(email.toLowerCase());
        }
        if(userId != null) {
            user = userRepository.findById(userId).orElseThrow(NotFoundException::new);
        }
        if (user == null || user.isActivated() || user.getValidationKey() == null) {
            throw new ConflictException("Cannot resend confirmation mail. Email already confirmed!");
        }

        return user;
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
        user.setEmail(toUpdate.getEmail());
        user.setInternalPhone(toUpdate.getInternalPhone());
        user.setActivated(toUpdate.isActivated());
        user.setBlocked(toUpdate.isBlocked());
        userRepository.save(user);
    }



    public void createStaffUser(StaffRegistration registration, Admin currentUser) throws BadRequestException {
        User createdStaff;
        switch (registration.getRole()) {
            case SUPPORT:
                createdStaff = new Support(registration);
                break;
            case STAKEHOLDER:
                createdStaff = new Stakeholder(registration);
                break;
            default:
                throw new BadRequestException("Bad request");
        }

        createdStaff.setActivated(true)
            .setCreated(ZonedDateTime.now());
        userRepository.save(createdStaff);
        staffActionLogger.logUserCreated(currentUser, createdStaff);

    }


    public void restoreAccountByUser(User user, Staff currentUser) {
        if (user instanceof Customer || user instanceof Stakeholder || user instanceof Support ) {
            restoreAccount(user);
        } else if (user instanceof Contractor) {
            restoreContractor((Contractor) user);
        } else {
            throw new BadRequestException(user.getRole() + " not allowed to restore");
        }
        staffActionLogger.logUserRestored(currentUser, user);
    }


    private void restoreContractor(Contractor contractor) {
        Company company = contractor.getCompany();
        if (company != null) {
            company.setDeleted(false);
            companyRepository.save(company);
        }
        restoreAccount(contractor);
    }

    private void restoreAccount(User user) {
        user.setDeleted(false);
        userRepository.save(user);
        mailService.sendRestoredAccount(user);
    }

    public void expireCredentials(long id) {
        Staff staff = staffRepository.findById(id)
            .orElseThrow(NotFoundException::new);
        staffRepository.save(staff.setCredentialExpired(true));
    }


    public Page<User> findBy(Long id, String email, String displayName, User.Role role, Pageable pageRequest) {
        if (User.Role.INCOMPLETE_PRO.equals(role)) {
            return userRepository.findIncompleteProsBy(id, email, displayName, pageRequest);
        }
        return userRepository.findBy(id, email, displayName, role, pageRequest);
    }
}
