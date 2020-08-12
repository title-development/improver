package com.improver.service;

import com.improver.entity.*;
import com.improver.exception.AuthenticationRequiredException;
import com.improver.exception.ConflictException;
import com.improver.exception.NotFoundException;
import com.improver.model.socials.SocialConnectionConfig;
import com.improver.model.socials.SocialUser;
import com.improver.repository.SocialConnectionRepository;
import com.improver.repository.UserRepository;
import com.improver.util.StringUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.validation.ValidationException;
import java.util.List;

import static java.util.Objects.nonNull;

@Slf4j
@Service
public class SocialConnectionService {

    @Autowired private UserRepository userRepository;
    @Autowired private RegistrationService registrationService;
    @Autowired private SocialConnectionRepository socialConnectionRepository;


    public User findExistingUser(SocialUser socialUser) {
        // by providerId
        SocialConnection connection = socialConnectionRepository.findByProviderId(socialUser.getId());
        if (connection != null) {
            if (connection.getUser().isDeleted() || connection.getUser().isBlocked()) {
                throw new AuthenticationRequiredException("Account has been deleted");
            }
            return connection.getUser();
        }

        // by email
        User user = userRepository.findByEmail(socialUser.getEmail()).orElse(null);
        if (user != null) {
            return addSocialConnection(user, socialUser);
        } else {
            return null;
        }
    }


    public User registerUser(SocialUser socialUser, boolean emailVerificationRequired, boolean preventConfirmationEmail) {
        Customer customer = Customer.of(socialUser);
        return registrationService.registerSocialUser(customer, socialUser, emailVerificationRequired, preventConfirmationEmail);
    }


    public User registerPro(SocialUser socialUser, SocialConnectionConfig socialConnectionConfig, String referredBy) throws AuthenticationRequiredException {
        boolean emailVerificationRequired = false;
        SocialConnection connection = socialConnectionRepository.findByProviderId(socialUser.getId());
        if (connection != null) {
            throw new ConflictException(StringUtil.capitalize(socialUser.getProvider().toString()) + " account is already connected to another user");
        }
        if (nonNull(socialConnectionConfig.getEmail())) {
            socialUser.setEmail(socialConnectionConfig.getEmail());
            emailVerificationRequired = true;
        }
        if (socialUser.getEmail() == null) {
            throw new ValidationException("Email is required");
        }
        User user = userRepository.findByEmail(socialUser.getEmail()).orElse(null);
        if(user != null) {
            throw new ConflictException("User with email "+socialUser.getEmail()+ " already registered");
        }
        Contractor contractor = Contractor.of(socialUser, socialConnectionConfig.getPhone(), referredBy);
        return registrationService.registerSocialUser(contractor, socialUser, emailVerificationRequired, false);
    }


    public void connect(SocialUser socialUser, User user) throws ConflictException {
        if (user.getSocialConnections().stream().anyMatch(connection -> connection.getProvider().equals(socialUser.getProvider()))) {
            throw new ConflictException("You have already connected " + StringUtil.capitalize(socialUser.getProvider().toString()));
        }
        SocialConnection existedConnection = socialConnectionRepository.findByProviderId(socialUser.getId());
        if (existedConnection != null) {
            throw new ConflictException(StringUtil.capitalize(socialUser.getProvider().toString()) + " account is already connected to another user");
        }
        if (user instanceof Contractor){
            addCompanySocialIcon((Contractor) user, socialUser);
        } else {
            addUserSocialIcon(user, socialUser);
        }
        SocialConnection socialConnection = new SocialConnection(socialUser, user);
        socialConnectionRepository.save(socialConnection);
    }

    private void addUserSocialIcon(User user, SocialUser socialUser) {
        if (socialUser.getPicture() != null && (user.getIconUrl() == null || user.getIconUrl().isEmpty())){
            user.setIconUrl(socialUser.getPicture());
        }
    }

    private void addCompanySocialIcon(Contractor contractor, SocialUser socialUser){
        Company company = contractor.getCompany();
        if (socialUser.getPicture() != null && (company.getIconUrl() == null || company.getIconUrl().isEmpty())) {
            company.setIconUrl(socialUser.getPicture());
        }
    }


    public List<SocialConnection> getSocialConnections(User user) {
        return socialConnectionRepository.findAllByUser(user);
    }


    public void disconnectSocial(User user, SocialConnection.Provider provider) throws ConflictException {
        SocialConnection socialConnection = socialConnectionRepository.findByUserAndProvider(user, provider).orElseThrow(NotFoundException::new);
        socialConnectionRepository.delete(socialConnection);
    }


    private User addSocialConnection(User user, SocialUser socialUser) {
        if (user.isDeleted() || user.isBlocked()) {
            throw new AuthenticationRequiredException("Account has been deleted");
        }
        SocialConnection socialConnection = new SocialConnection(socialUser, user);
        user.addSocialConnection(socialConnection);
        socialConnectionRepository.save(socialConnection);
        return user;
    }

}
