package com.improver.service;

import com.improver.entity.Customer;
import com.improver.entity.SocialConnection;
import com.improver.entity.User;
import com.improver.exception.AuthenticationRequiredException;
import com.improver.exception.ConflictException;
import com.improver.exception.NotFoundException;
import com.improver.model.socials.SocialUser;
import com.improver.repository.CustomerRepository;
import com.improver.repository.SocialConnectionRepository;
import com.improver.repository.UserRepository;
import com.improver.security.UserSecurityService;
import com.improver.util.StringUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;
import java.util.List;

@Service
public class SocialConnectionService {

    @Autowired private UserRepository userRepository;
    @Autowired private CustomerRepository customerRepository;
    @Autowired private SocialConnectionRepository socialConnectionRepository;
    @Autowired private UserSecurityService userSecurityService;

    public User authorize(SocialUser socialUser, SocialConnection.Provider provider) throws AuthenticationRequiredException {

        if (socialUser.getEmail() == null || socialUser.getEmail().isEmpty()) {
            throw new AuthenticationRequiredException("Email address is required");
        }

        SocialConnection connection = socialConnectionRepository.findByProviderId(socialUser.getId());
        if (connection != null) {
            if (connection.getUser().isDeleted() || connection.getUser().isBlocked()) {
                throw new AuthenticationRequiredException("Account has been deleted");
            }
            return connection.getUser();
        }

        User user = userRepository.findByEmail(socialUser.getEmail()).orElse(null);
        if (user != null) {
            if (user.isDeleted() || user.isBlocked()) {
                throw new AuthenticationRequiredException("Account has been deleted");
            }
            SocialConnection socialConnection = new SocialConnection()
                .setProviderId(socialUser.getId())
                .setProvider(provider)
                .setCreated(ZonedDateTime.now())
                .setUser(user);
            user.addSocialConnection(socialConnection);
            socialConnectionRepository.save(socialConnection);

            return user;
        } else {
            Customer customer = new Customer()
                .setEmail(socialUser.getEmail())
                .setFirstName(socialUser.getFirstName())
                .setLastName(socialUser.getLastName())
                .setActivated(true)
                .setCreated(ZonedDateTime.now())
                .setIconUrl(socialUser.getPicture());
            SocialConnection socialConnection = new SocialConnection()
                .setProviderId(socialUser.getId())
                .setProvider(provider)
                .setUser(customer)
                .setCreated(ZonedDateTime.now());
            customer.addSocialConnection(socialConnection);
            customerRepository.save(customer);
            socialConnectionRepository.save(socialConnection);

            return customer;
        }
    }

    public void connect(SocialUser socialUser, SocialConnection.Provider provider) throws ConflictException {
        User user = userSecurityService.currentUser();
        if (user.getSocialConnections().stream().anyMatch(connection -> connection.getProvider().equals(provider))) {
            throw new ConflictException("You have already connected " + StringUtil.capitalize(provider.toString()));
        }
        SocialConnection existedConnection = socialConnectionRepository.findByProviderId(socialUser.getId());
        if (existedConnection != null) {
            throw new ConflictException(StringUtil.capitalize(provider.toString())+ " account is already connected to another user");
        }
        SocialConnection socialConnection = new SocialConnection()
            .setProviderId(socialUser.getId())
            .setProvider(provider)
            .setCreated(ZonedDateTime.now())
            .setUser(user);
        user.addSocialConnection(socialConnection);
        socialConnectionRepository.save(socialConnection);
    }

    public List<SocialConnection> getSocialConnections() {
        User user = userSecurityService.currentUser();
        return socialConnectionRepository.findAllByUser(user);
    }

    public void disconnectSocial(SocialConnection.Provider provider) throws ConflictException {
        User user = userSecurityService.currentUser();
        SocialConnection socialConnection = socialConnectionRepository.findByUserAndProvider(user, provider).orElseThrow(NotFoundException::new);
        socialConnectionRepository.delete(socialConnection);

    }
}
