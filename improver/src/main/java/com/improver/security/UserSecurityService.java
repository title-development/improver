package com.improver.security;

import com.improver.entity.*;
import com.improver.exception.AuthenticationRequiredException;
import com.improver.exception.NotFoundException;
import com.improver.model.out.LoginModel;
import com.improver.repository.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.*;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import javax.servlet.http.HttpServletResponse;
import java.time.ZonedDateTime;
import java.util.Collections;
import java.util.UUID;

import static com.improver.entity.User.Role.CONTRACTOR;
import static com.improver.entity.User.Role.INCOMPLETE_PRO;
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
    @Autowired private StaffRepository staffRepository;
    @Autowired private AdminRepository adminRepository;

    /**
     * Intended to be used by {@link LoginFilter}.
     *
     */
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(username)
            .orElseThrow(() -> new UsernameNotFoundException(String.format("No user found with username '%s'.", username)));
        return user instanceof Contractor ? ofContractor((Contractor) user)
            : new UserDetailsImpl(user);
    }

    /**
     * Handles {@link User.Role#INCOMPLETE_PRO} activation scenario.
     *
     */
    private UserDetailsImpl ofContractor(Contractor contractor){
        User.Role role = contractor.isIncomplete()? INCOMPLETE_PRO : contractor.getRole();
        return new UserDetailsImpl(contractor.getEmail(),
            contractor.getPassword(),
            !contractor.isDeleted(),
            !contractor.isBlocked(),
            true,
            contractor.isIncomplete() || contractor.isActivated(),
            Collections.singletonList(new SimpleGrantedAuthority(role.toString())));
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

    public Staff currentStaff() throws AuthenticationRequiredException {
        return staffRepository.findByEmail(loggedUserEmail())
            .orElseThrow(AuthenticationRequiredException::new);
    }

    public Admin currentAdmin() throws AuthenticationRequiredException {
        return adminRepository.findByEmail(loggedUserEmail())
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

    public Admin currentAdminOrNull() {
        return adminRepository.findByEmail(loggedUserEmail())
            .orElse(null);
    }


    public User findByRefreshId(String refreshToken) {
        return userRepository.findByRefreshId(refreshToken);
    }


    public User getByEmail(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(NotFoundException::new);
    }

    public void performLogout(User user, HttpServletResponse res) {
        TokenProvider.eraseRefreshCookie(res);
    }

    /**
     * Login user into system:
     * - update lastLogin time,
     * - sets "Authorization" header with JWT,
     * - adds refresh cookie.
     *
     * @param user to login
     * @param res  HttpServletResponse
     * @return model of logged in user
     */
    public LoginModel performUserLogin(User user, HttpServletResponse res) {
        //updateLastLogin
        User updated = userRepository.save(user.setLastLogin(ZonedDateTime.now()).setRefreshId(UUID.randomUUID().toString()));
        LoginModel loginModel = getLoginModel(updated);
        String jwt = getAccessJWT(updated);
        res.setHeader(AUTHORIZATION_HEADER_NAME, BEARER_TOKEN_PREFIX + jwt);
        res.addCookie(TokenProvider.buildRefreshCookie(loginModel.getRefreshId()));
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
     * Performs account security check for given user.
     * Handles {@link User.Role#INCOMPLETE_PRO} activation scenario.
     *
     * @param user - user to check
     * @throws DisabledException           - when account not activated
     * @throws LockedException             - when account is blocked
     * @throws CredentialsExpiredException - for {@link Staff} only,  when credentials expired
     * @throws AccountExpiredException     - when account was deleted
     */
    public void checkUser(User user) throws DisabledException, LockedException, CredentialsExpiredException, AccountExpiredException {
        if(!user.isActivated()) {
            if (user instanceof Contractor && ((Contractor) user).isIncomplete()) {
            } else {
                throw new DisabledException(ACCOUNT_NOT_ACTIVATED_MSG);
            }
        }
        if (user.isBlocked()) {
            throw new LockedException(ACCOUNT_BLOCKED_MSG);
        }
        if (user.isDeleted()) {
            throw new AccountExpiredException(ACCOUNT_DELETED_MSG);
        }
        if (user instanceof Staff) {
            if (((Staff) user).isCredentialExpired()) {
                throw new CredentialsExpiredException(CREDENTIALS_EXPIRED_MSG);
            }
        }
    }


    /**
     * Handles {@link User.Role#INCOMPLETE_PRO} activation scenario.
     *
     * @param user
     * @return
     */
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
        return new LoginModel(user.getId(), iconUrl, displayName, role, companyId, user.getRefreshId(), user.getEmail());
    }

    private String loggedUserEmail() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    /**
     * Handles {@link User.Role#INCOMPLETE_PRO} activation scenario.
     */
    public String getAccessJWT(User user) {
        User.Role role = user.getRole();
        if (user instanceof Contractor && ((Contractor) user).isIncomplete()) {
            role = INCOMPLETE_PRO;
        }
        return jwtUtil.generateAccessJWT(user.getEmail(), role.toString());
    }
}
