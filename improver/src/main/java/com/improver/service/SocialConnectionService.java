package com.improver.service;

import com.improver.entity.Contractor;
import com.improver.entity.Customer;
import com.improver.entity.SocialConnection;
import com.improver.entity.User;
import com.improver.exception.AuthenticationRequiredException;
import com.improver.exception.ConflictException;
import com.improver.exception.NotFoundException;
import com.improver.model.socials.SocialUser;
import com.improver.repository.ContractorRepository;
import com.improver.repository.CustomerRepository;
import com.improver.repository.SocialConnectionRepository;
import com.improver.repository.UserRepository;
import com.improver.util.StringUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

import javax.validation.Valid;
import java.util.List;

@Service
@Validated
public class SocialConnectionService {

    @Autowired private UserRepository userRepository;
    @Autowired private CustomerRepository customerRepository;
    @Autowired private ContractorRepository contractorRepository;
    @Autowired private SocialConnectionRepository socialConnectionRepository;
    @Autowired private UserService userService;

    public User findExistingOrRegister(@Valid SocialUser socialUser) throws AuthenticationRequiredException {
        SocialConnection connection = socialConnectionRepository.findByProviderId(socialUser.getId());
        if (connection != null) {
            if (connection.getUser().isDeleted() || connection.getUser().isBlocked()) {
                throw new AuthenticationRequiredException("Account has been deleted");
            }
            return connection.getUser();
        }

        User user = userRepository.findByEmail(socialUser.getEmail()).orElse(null);
        if (user != null) {
            return addSocialConnection(user, socialUser);
        } else {
            Customer customer = Customer.of(socialUser);

            return userService.registerUser(customer, socialUser);
        }
    }

    public User registerPro(@Valid SocialUser socialUser, String phone, String referredBy) throws AuthenticationRequiredException {
        SocialConnection connection = socialConnectionRepository.findByProviderId(socialUser.getId());
        if (connection != null) {
            throw new AuthenticationRequiredException(StringUtil.capitalize(socialUser.getProvider().toString()) + " account is already connected to another user");
        }

        User user = userRepository.findByEmail(socialUser.getEmail()).orElse(null);
        if(user != null) {
            throw new AuthenticationRequiredException("User with email "+socialUser.getEmail()+ " already registered");
        }

        String refCode = UserService.generateRefCode();
        Contractor contractor = Contractor.of(socialUser, phone, refCode, referredBy);

        return userService.registerUser(contractor, socialUser);
    }

    public void connect(@Valid SocialUser socialUser, User user) throws ConflictException {
        if (user.getSocialConnections().stream().anyMatch(connection -> connection.getProvider().equals(socialUser.getProvider()))) {
            throw new ConflictException("You have already connected " + StringUtil.capitalize(socialUser.getProvider().toString()));
        }
        SocialConnection existedConnection = socialConnectionRepository.findByProviderId(socialUser.getId());
        if (existedConnection != null) {
            throw new ConflictException(StringUtil.capitalize(socialUser.getProvider().toString()) + " account is already connected to another user");
        }
        SocialConnection socialConnection = new SocialConnection(socialUser, user);
        socialConnectionRepository.save(socialConnection);
    }

    public List<SocialConnection> getSocialConnections(User user) {

        return socialConnectionRepository.findAllByUser(user);
    }

    public void disconnectSocial(User user, SocialConnection.Provider provider) throws ConflictException {
        SocialConnection socialConnection = socialConnectionRepository.findByUserAndProvider(user, provider).orElseThrow(NotFoundException::new);
        socialConnectionRepository.delete(socialConnection);
    }

    private User addSocialConnection(User user, @Valid SocialUser socialUser) {
        if (user.isDeleted() || user.isBlocked()) {
            throw new AuthenticationRequiredException("Account has been deleted");
        }
        SocialConnection socialConnection = new SocialConnection(socialUser, user);
        user.addSocialConnection(socialConnection);
        socialConnectionRepository.save(socialConnection);

        return user;
    }
}
