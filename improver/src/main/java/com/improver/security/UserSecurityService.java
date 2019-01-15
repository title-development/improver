package com.improver.security;

import com.improver.entity.Company;
import com.improver.entity.Contractor;
import com.improver.entity.Customer;
import com.improver.entity.User;
import com.improver.exception.AuthenticationRequiredException;
import com.improver.exception.NotFoundException;
import com.improver.model.out.LoginModel;
import com.improver.repository.ContractorRepository;
import com.improver.repository.CustomerRepository;
import com.improver.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import javax.servlet.http.HttpServletResponse;
import java.time.ZonedDateTime;
import java.util.UUID;

import static com.improver.security.SecurityProperties.*;
import static com.improver.security.SecurityProperties.ACCOUNT_BLOCKED_MSG;

@Slf4j
@Service
public class UserSecurityService implements UserDetailsService {

    @Autowired private UserRepository userRepository;
    @Autowired private ContractorRepository contractorRepository;
    @Autowired private CustomerRepository customerRepository;
    @Autowired private JwtUtil jwtUtil;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(username)
            .orElseThrow(() -> new UsernameNotFoundException(String.format("No user found with username '%s'.", username)));
        return new UserDetailsImpl(user);
    }

    public User findByRefreshId(String refreshToken) {
        return userRepository.findByRefreshId(refreshToken);
    }


    public User getByEmail(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(NotFoundException::new);
    }

    public LoginModel performUserLogin(User user, HttpServletResponse res) {
        LoginModel loginModel = loginUser(user);
        String jwt = jwtUtil.generateAccessJWT(user.getEmail(), user.getRole().toString());
        res.setHeader(AUTHORIZATION_HEADER_NAME, BEARER_TOKEN_PREFIX + jwt);
        res.addCookie(TokenProvider.buildRefreshCookie(loginModel.getRefreshId()));
        return loginModel;
    }

    /**
     * Updates lastLogin time and refreshId
     */
    LoginModel loginUser(User user) {
        //updateLastLogin
        String refreshId = UUID.randomUUID().toString();
        User saved = userRepository.save(user.setLastLogin(ZonedDateTime.now()).setRefreshId(refreshId));
        LoginModel loginModel = getLoginModel(saved);
        log.info("User {} logged in", user.getEmail());
        return loginModel;
    }


    public LoginModel getCurrentPrincipal() {
        User currentUser = currentUser();
        if (!currentUser.isActivated()) {
            throw new AuthenticationRequiredException(ACCOUNT_NOT_ACTIVATED_MSG);
        }
        if (currentUser.isDeleted()) {
            throw new AuthenticationRequiredException(ACCOUNT_DELETED_MSG);
        }
        if (currentUser.isBlocked()) {
            throw new AuthenticationRequiredException(ACCOUNT_BLOCKED_MSG);
        }
        LoginModel loginModel = getLoginModel(currentUser);
        return loginModel;
    }


    private LoginModel getLoginModel(User user) {
        String displayName = user.getDisplayName();
        String iconUrl = user.getIconUrl();
        String companyId = null;
        if (User.Role.CONTRACTOR.equals(user.getRole())) {
            Company company = ((Contractor) user).getCompany();
            if (company == null) {
                throw new IllegalStateException("Company is not defined for " + user.getEmail());
            } else {
                iconUrl = company.getIconUrl();
                companyId = company.getId();
                displayName = company.getName();
            }
        }
        return new LoginModel(user.getId(), iconUrl, displayName, user.getRole().toString(), companyId, user.getRefreshId());
    }

    public User currentUser() throws AuthenticationRequiredException {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByEmail(auth.getName())
            .orElseThrow(AuthenticationRequiredException::new);
    }

    public Contractor currentPro() throws AuthenticationRequiredException {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return contractorRepository.findByEmail(auth.getName())
            .orElseThrow(AuthenticationRequiredException::new);
    }

    public Customer currentCustomer() throws AuthenticationRequiredException {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return customerRepository.findByEmail(auth.getName())
            .orElseThrow(AuthenticationRequiredException::new);
    }

    public User currentUserOrNull() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByEmail(auth.getName())
            .orElse(null);
    }

    public Customer currentCustomerOrNull() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return customerRepository.findByEmail(auth.getName())
            .orElse(null);
    }

    public Contractor currentProOrNull() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return contractorRepository.findByEmail(auth.getName())
            .orElse(null);
    }
}
