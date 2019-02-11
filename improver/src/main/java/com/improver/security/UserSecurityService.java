package com.improver.security;

import com.improver.entity.*;
import com.improver.exception.AuthenticationRequiredException;
import com.improver.exception.NotFoundException;
import com.improver.model.out.LoginModel;
import com.improver.repository.ContractorRepository;
import com.improver.repository.CustomerRepository;
import com.improver.repository.StaffRepository;
import com.improver.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.*;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import javax.servlet.http.HttpServletResponse;
import java.time.ZonedDateTime;
import java.util.UUID;

import static com.improver.entity.User.Role.CONTRACTOR;
import static com.improver.security.SecurityProperties.AUTHORIZATION_HEADER_NAME;
import static com.improver.security.SecurityProperties.BEARER_TOKEN_PREFIX;
import static com.improver.util.ErrorMessages.*;

@Slf4j
@Service
public class UserSecurityService implements UserDetailsService {

    @Autowired private UserRepository userRepository;
    @Autowired private ContractorRepository contractorRepository;
    @Autowired private CustomerRepository customerRepository;
    @Autowired private JwtUtil jwtUtil;
    @Autowired
    private StaffRepository staffRepository;

    /**
     * Intended to be used by {@link LoginFilter}
     */
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(username)
            .orElseThrow(() -> new UsernameNotFoundException(String.format("No user found with username '%s'.", username)));
        return new UserDetailsImpl(user);
    }

    public User currentUser() throws AuthenticationRequiredException {
        return userRepository.findByEmail(loggedUserEmail())
            .orElseThrow(AuthenticationRequiredException::new);
    }

    public Contractor currentPro() throws AuthenticationRequiredException {
        return contractorRepository.findByEmail(loggedUserEmail())
            .orElseThrow(AuthenticationRequiredException::new);
    }

    public Customer currentCustomer() throws AuthenticationRequiredException {
        return customerRepository.findByEmail(loggedUserEmail())
            .orElseThrow(AuthenticationRequiredException::new);
    }

    public User currentUserOrNull() {
        return userRepository.findByEmail(loggedUserEmail())
            .orElse(null);
    }

    public Customer currentCustomerOrNull() {
        return customerRepository.findByEmail(loggedUserEmail())
            .orElse(null);
    }

    public Contractor currentProOrNull() {
        return contractorRepository.findByEmail(loggedUserEmail())
            .orElse(null);
    }

    public Staff currentStaffOrNull() {
        return staffRepository.findByEmail(loggedUserEmail())
            .orElse(null);
    }



    public User findByRefreshId(String refreshToken) {
        return userRepository.findByRefreshId(refreshToken);
    }


    public User getByEmail(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(NotFoundException::new);
    }

    public void performLogout(User user, HttpServletResponse res){
        TokenProvider.eraseRefreshCookie(res);
    }

    @Deprecated
    public LoginModel performUserLogin(User user, HttpServletResponse res) {
        LoginModel loginModel = updateLoggedUser(user);
        String jwt = jwtUtil.generateAccessJWT(user.getEmail(), loginModel.getRole()); //TODO Misha
        res.setHeader(AUTHORIZATION_HEADER_NAME, BEARER_TOKEN_PREFIX + jwt);
        res.addCookie(TokenProvider.buildRefreshCookie(loginModel.getRefreshId()));
        return loginModel;
    }

    /**
     * Updates lastLogin time and refreshId
     */
    LoginModel updateLoggedUser(User user) {
        //updateLastLogin
        String refreshId = UUID.randomUUID().toString();
        User saved = userRepository.save(user.setLastLogin(ZonedDateTime.now()).setRefreshId(refreshId));
        LoginModel loginModel = getLoginModel(saved);
        log.info("User {} logged in", user.getEmail());
        return loginModel;
    }


    LoginModel getCurrentPrincipal() {
        User currentUser = currentUser();
        try {
            checkUser(currentUser);
        } catch (AuthenticationException e) {
            throw new AuthenticationRequiredException(e.getMessage());
        }
        return getLoginModel(currentUser);
    }

    /**
     * Performs account security check for given user
     *
     * @param user - user to check
     * @throws DisabledException           - when account not activated
     * @throws LockedException             - when account is blocked
     * @throws CredentialsExpiredException - for {@link Staff} only,  when credentials expired
     * @throws AccountExpiredException     - when account was deleted
     */
    public void checkUser(User user) throws DisabledException, LockedException, CredentialsExpiredException, AccountExpiredException {
        if (!user.isActivated() && !CONTRACTOR.equals(user.getRole())) {
            throw new DisabledException(ACCOUNT_NOT_ACTIVATED_MSG);
        }
        if (user.isBlocked()) {
            throw new LockedException(ACCOUNT_BLOCKED_MSG);
        }
        if (user.isDeleted()) {
            throw new AccountExpiredException(ACCOUNT_DELETED_MSG);
        }
        if (user instanceof Staff) {
            // TODO: Add more logic here
            if (((Staff) user).isCredentialExpired()) {
                throw new CredentialsExpiredException(CREDENTIALS_EXPIRED_MSG);
            }
        }
    }



    private LoginModel getLoginModel(User user) {
        String displayName = user.getDisplayName();
        String iconUrl = user.getIconUrl();
        String companyId = null;
        User.Role role = user.getRole();
        if (CONTRACTOR.equals(role)) {
            Company company = ((Contractor) user).getCompany();
            if (company == null) {
                role = User.Role.INCOMPLETE_PRO;
                log.debug("Not fully registered Pro={} login", user.getEmail());
            } else {
                iconUrl = company.getIconUrl();
                companyId = company.getId();
                displayName = company.getName();
            }
        }
        return new LoginModel(user.getId(), iconUrl, displayName, role, companyId, user.getRefreshId());
    }

    private String loggedUserEmail() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }
}
