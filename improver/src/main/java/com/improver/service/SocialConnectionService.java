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

    public User findExistingOrRegister(SocialUser socialUser, SocialConnection.Provider provider) throws AuthenticationRequiredException {
        if (socialUser.getEmail() == null || socialUser.getEmail().isEmpty()) {
            throw new AuthenticationRequiredException("Email address is required");
        }

        // Searching user in social connection by providerId
        SocialConnection connection = socialConnectionRepository.findByProviderId(socialUser.getId());
        if (connection != null) {
            if (connection.getUser().isDeleted() || connection.getUser().isBlocked()) {
                throw new AuthenticationRequiredException("Account has been deleted");
            }

            return connection.getUser();
        }

        // Searching user in users by provider email
        User user = userRepository.findByEmail(socialUser.getEmail()).orElse(null);
        if (user != null) {
            if (user.isDeleted() || user.isBlocked()) {
                throw new AuthenticationRequiredException("Account has been deleted");
            }
            SocialConnection socialConnection = new SocialConnection(socialUser.getId(), provider, user);
            user.addSocialConnection(socialConnection);
            socialConnectionRepository.save(socialConnection);

            return user;
        } else {

            return registerCustomer(socialUser, provider);
        }
    }

    public void connect(SocialUser socialUser, User user, SocialConnection.Provider provider) throws ConflictException {
        if (user.getSocialConnections().stream().anyMatch(connection -> connection.getProvider().equals(provider))) {
            throw new ConflictException("You have already connected " + StringUtil.capitalize(provider.toString()));
        }
        SocialConnection existedConnection = socialConnectionRepository.findByProviderId(socialUser.getId());
        if (existedConnection != null) {
            throw new ConflictException(StringUtil.capitalize(provider.toString())+ " account is already connected to another user");
        }
        SocialConnection socialConnection = new SocialConnection(socialUser.getId(), provider, user);
        socialConnectionRepository.save(socialConnection);
    }

    public List<SocialConnection> getSocialConnections(User user) {

        return socialConnectionRepository.findAllByUser(user);
    }

    public void disconnectSocial(User user, SocialConnection.Provider provider) throws ConflictException {
        SocialConnection socialConnection = socialConnectionRepository.findByUserAndProvider(user, provider).orElseThrow(NotFoundException::new);
        socialConnectionRepository.delete(socialConnection);
    }

    private Customer registerCustomer(SocialUser socialUser, SocialConnection.Provider provider) {
        Customer customer = Customer.of(socialUser);
        SocialConnection socialConnection = new SocialConnection(socialUser.getId(), provider, customer);
        customer.addSocialConnection(socialConnection);
        customerRepository.save(customer);
        socialConnectionRepository.save(socialConnection);

        return customer;
    }
}
