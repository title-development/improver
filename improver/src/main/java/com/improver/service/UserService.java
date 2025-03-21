package com.improver.service;

import com.improver.entity.*;
import com.improver.exception.BadRequestException;
import com.improver.exception.NotFoundException;
import com.improver.exception.ValidationException;
import com.improver.model.admin.AdminContractor;
import com.improver.model.admin.UserModel;
import com.improver.model.in.OldNewValue;
import com.improver.model.in.registration.StaffRegistration;
import com.improver.repository.*;
import com.improver.util.mail.MailService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;

import static com.improver.util.ErrorMessages.ERR_MSG_PASS_MINIMUM_REQUIREMENTS;
import static com.improver.util.serializer.SerializationUtil.PASS_PATTERN;


@Slf4j
@Service
public class UserService {

    @Autowired private UserRepository userRepository;
    @Autowired private MailService mailService;
    @Autowired private ImageService imageService;
    @Autowired private CompanyRepository companyRepository;
    @Autowired private StaffActionLogger staffActionLogger;
    @Autowired private SearchRepository searchRepository;


    public void changeUserBlockedStatus(Long id, boolean blocked, Admin currentAdmin) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new BadRequestException("User not exist"));
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


    public Page<AdminContractor> getAllContractors(Long id, String displayName, String email, String companyName,
                                                   ZonedDateTime createdFrom, ZonedDateTime createdTo,
                                                   ZonedDateTime updatedFrom, ZonedDateTime updatedTo,
                                                   Pageable pageable) {
        return (null == companyName || companyName.isEmpty())
            ? userRepository.getAllContractors(id, displayName, email, createdFrom, createdTo, updatedFrom, updatedTo, pageable)
            : userRepository.getAllContractorsJoinCompanies(id, displayName, email, companyName, createdFrom, createdTo, updatedFrom, updatedTo, pageable);
    }

    public Page<User> getAllCustomers(Long id, String displayName, String email,
                                      ZonedDateTime createdFrom, ZonedDateTime createdTo,
                                      ZonedDateTime updatedFrom, ZonedDateTime updatedTo,
                                      Pageable pageable) {
        return userRepository.getAllCustomers(id, displayName, email, createdFrom, createdTo, updatedFrom, updatedTo, pageable);
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



    public Page<User> findBy(Long id, String email, String displayName, User.Role role,
                             ZonedDateTime createdFrom, ZonedDateTime createdTo,
                             ZonedDateTime updatedFrom, ZonedDateTime updatedTo,
                             Pageable pageRequest) {
        if (User.Role.INCOMPLETE_PRO.equals(role)) {
            return userRepository.findIncompleteProsBy(id, email, displayName, createdFrom, createdTo,
                updatedFrom, updatedTo, pageRequest);
        }
        return userRepository.findBy(id, email, displayName, role, createdFrom, createdTo,
            updatedFrom, updatedTo, pageRequest);
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
