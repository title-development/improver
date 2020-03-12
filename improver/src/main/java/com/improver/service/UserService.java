package com.improver.service;

import com.improver.entity.*;
import com.improver.exception.*;
import com.improver.model.admin.AdminContractor;
import com.improver.model.admin.UserModel;
import com.improver.model.in.OldNewValue;
import com.improver.model.in.registration.StaffRegistration;
import com.improver.model.in.registration.UserRegistration;
import com.improver.model.socials.SocialUser;
import com.improver.repository.*;
import com.improver.util.mail.MailService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;
import java.util.UUID;

import static com.improver.util.ErrorMessages.ERR_MSG_PASS_MINIMUM_REQUIREMENTS;
import static com.improver.util.serializer.SerializationUtil.PASS_PATTERN;


@Slf4j
@Service
public class UserService {

    @Autowired private UserRepository userRepository;
    @Autowired private ContractorRepository contractorRepository;
    @Autowired private CustomerRepository customerRepository;
    @Autowired private MailService mailService;
    @Autowired private ImageService imageService;
    @Autowired private CompanyRepository companyRepository;
    @Autowired private SocialConnectionRepository socialConnectionRepository;
    @Autowired private StaffActionLogger staffActionLogger;
    @Autowired private SearchRepository searchRepository;


    public User getByEmail(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(NotFoundException::new);
    }



    public void changeUserBlockedStatus(Long id, boolean blocked, Admin currentAdmin) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new BadRequestException("Bad request"));
        user.setBlocked(blocked);
        mailService.sendBlockAccount(user);
        userRepository.save(user);
        staffActionLogger.logChangeAccountBlockingStatus(currentAdmin, user);
    }


    public void updateUser(long id, UserModel toUpdate, Admin currentAdmin) {
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
        return contractorRepository.save(new Contractor(registration)
            .setReferredBy(registration.getReferralCode())
            .setValidationKey(validationKey)
            .setIncomplete(true)
        );
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


    public void deleteIcon(User user) {
        String imageUrl = user.getIconUrl();
        if (imageUrl == null || imageUrl.isEmpty()) {
            throw new NotFoundException();
        }
        imageService.silentDelete(imageUrl);
        updateIcon(user, null);
    }


    public boolean isEmailFree(String email) {
        return userRepository.isEmailFree(email);
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

    public void updateAdminUser(long id, UserModel toUpdate) {
        User user = userRepository.findById(id)
            .orElseThrow(NotFoundException::new);

        user.setFirstName(toUpdate.getFirstName());
        user.setLastName(toUpdate.getLastName());
        user.setEmail(toUpdate.getEmail());
        user.setInternalPhone(toUpdate.getInternalPhone());
        user.setActivated(toUpdate.getIsActivated());
        user.setBlocked(toUpdate.getIsBlocked());
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



    public Page<User> findBy(Long id, String email, String displayName, User.Role role, Pageable pageRequest) {
        if (User.Role.INCOMPLETE_PRO.equals(role)) {
            return userRepository.findIncompleteProsBy(id, email, displayName, pageRequest);
        }
        return userRepository.findBy(id, email, displayName, role, pageRequest);
    }


    public void saveUserSearches(User user, String search, String zipCode, boolean isManual) {
        UserSearch userSearch = new UserSearch()
            .setCreated(ZonedDateTime.now())
            .setSearch(search)
            .setZip(zipCode)
            .setManual(isManual);

        if (user != null){
            userSearch.setUserId(String.valueOf(user.getId()));
        }
       searchRepository.save(userSearch);
    }

}
