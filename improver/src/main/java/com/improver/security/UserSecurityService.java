package com.improver.security;

import com.improver.application.properties.Environments;
import com.improver.application.properties.SecurityProperties;
import com.improver.entity.*;
import com.improver.exception.AuthenticationRequiredException;
import com.improver.exception.NotFoundException;
import com.improver.model.out.LoginModel;
import com.improver.repository.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AccountExpiredException;
import org.springframework.security.authentication.CredentialsExpiredException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.time.ZonedDateTime;
import java.util.Collections;
import java.util.UUID;

import static com.improver.application.properties.Path.REFRESH_COOKIE_PATH;
import static com.improver.application.properties.SecurityProperties.REFRESH_COOKIE_NAME;
import static com.improver.entity.User.Role.CONTRACTOR;
import static com.improver.entity.User.Role.INCOMPLETE_PRO;
import static com.improver.security.JwtUtil.AUTHORIZATION_HEADER_NAME;
import static com.improver.security.JwtUtil.BEARER_TOKEN_PREFIX;
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
    @Autowired private SecurityProperties securityProperties;
    @Value("${spring.profiles.active:Unknown}") private String activeProfile;
    @Value("${server.domain}") private String serverDomain;
    @Autowired private UserSessionRepository userSessionRepository;


    /**
     * Intended to be used by {@link LoginFilter}.
     * Handles {@link User.Role#INCOMPLETE_PRO} activation scenario.
     */
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(username)
            .orElseThrow(() -> new UsernameNotFoundException(String.format("No user found with username '%s'.", username)));
        if  (user instanceof Contractor) {
            Contractor contractor = (Contractor) user;
            User.Role role = contractor.isIncomplete() ? INCOMPLETE_PRO : contractor.getRole();
            return new UserDetailsImpl(contractor.getEmail(), contractor.getPassword(), !contractor.isDeleted(), !contractor.isBlocked(),
                contractor.isIncomplete() || contractor.isActivated(),
                Collections.singletonList(new SimpleGrantedAuthority(role.toString())));
        }
        if (user instanceof Customer) {
            return new UserDetailsImpl(user, true);
        }
        return new UserDetailsImpl(user);
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
                log.debug("Pass through incomplete PRO " + user.getEmail());
            } else if (user instanceof Customer) {
                log.debug("Pass through not activated CUSTOMER " + user.getEmail());
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
        eraseRefreshCookie(res);
    }

    /**
     * Login user into system:
     * - update lastLogin time,
     * - saves userSession data
     * - sets "Authorization" header with JWT,
     * - adds refresh cookie.
     *
     * @param user to login
     * @param res  HttpServletResponse
     * @return model of logged in user
     */
    public LoginModel performUserLogin(User user, HttpServletRequest req, HttpServletResponse res) {
        //updateLastLogin
        log.info("User {} logged in", user.getEmail());
        return performUserLogin(user, req,  res, false);
    }


    public LoginModel performUserLogin(User user, HttpServletRequest req, HttpServletResponse res, boolean isReauthentication) {
        if (isReauthentication) {
            log.debug("Re-authentication user=" + user.getEmail());
        }
        //updateLastLogin
        ZonedDateTime now = ZonedDateTime.now();
        User updated = userRepository.save(user.setLastLogin(now).setRefreshId(UUID.randomUUID().toString()));
        userSessionRepository.save(new UserSession(user, req.getRemoteAddr(), null, null, user.getRefreshId(), isReauthentication, now));
        LoginModel loginModel = buildLoginModel(updated);
        String jwt = generateAccessToken(updated);
        res.setHeader(AUTHORIZATION_HEADER_NAME, BEARER_TOKEN_PREFIX + jwt);
        res.addCookie(buildRefreshCookie(loginModel.getRefreshId(), securityProperties.maxUserSessionIdle()));

        return loginModel;
    }


    LoginModel getCurrentPrincipal() {
        User currentUser = currentUser();
        try {
            checkUser(currentUser);
        } catch (AuthenticationException e) {
            throw new AuthenticationRequiredException(e.getMessage());
        }
        return buildLoginModel(currentUser);
    }




    /**
     * Handles {@link User.Role#INCOMPLETE_PRO} activation scenario.
     *
     * @param user
     * @return
     */
    private LoginModel buildLoginModel(User user) {
        String displayName = user.getDisplayName();
        String iconUrl = user.getIconUrl();
        Long companyId = null;
        User.Role role = user.getRole();
        if (CONTRACTOR.equals(role)) {
            Company company = ((Contractor) user).getCompany();
            if (company == null) {
                role = User.Role.INCOMPLETE_PRO;
                log.debug("Login incomplete PRO {}", user.getEmail());
            } else {
                iconUrl = company.getIconUrl();
                companyId = company.getId();
                displayName = company.getName();
            }
        }
        return new LoginModel(user.getId(), iconUrl, displayName, role, user.isActivated(), companyId, user.getRefreshId(), user.getEmail());
    }

    private String loggedUserEmail() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    /**
     * Handles {@link User.Role#INCOMPLETE_PRO} activation scenario.
     */
    public String generateAccessToken(User user) {
        User.Role role = user.getRole();
        if (user instanceof Contractor && ((Contractor) user).isIncomplete()) {
            role = INCOMPLETE_PRO;
        }
        return jwtUtil.generateAccessJWT(user.getEmail(), role.toString());
    }



    public Cookie buildRefreshCookie(String refreshToken, long refreshTokenExpiration) {
        return newCookie(REFRESH_COOKIE_NAME, refreshToken, REFRESH_COOKIE_PATH, Math.toIntExact(refreshTokenExpiration / 1000));
    }


    public void eraseRefreshCookie(HttpServletResponse response) {
        Cookie cookie = newCookie(REFRESH_COOKIE_NAME, null, REFRESH_COOKIE_PATH, 0);
        response.addCookie(cookie);
    }

    public String getRefreshTokenFromCookie(HttpServletRequest request){
        Cookie cookie = getCookie(request, REFRESH_COOKIE_NAME);
        if(cookie == null) {
            return null;
        }
        return cookie.getValue();
    }



    private Cookie getCookie(HttpServletRequest request, String name) {
        if (request.getCookies() == null) {
            return null;
        }
        for (int i = 0; i < request.getCookies().length; i++) {
            if (request.getCookies()[i].getName().equals(name)) {
                return request.getCookies()[i];
            }
        }
        return null;
    }


    private Cookie newCookie(String name, String data, String path, int maxAge) {
        Cookie cookie = new Cookie(name, data);
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        cookie.setPath(path);
        cookie.setMaxAge(maxAge);
        if (activeProfile.equals(Environments.PROD) || activeProfile.equals(Environments.STG) || activeProfile.equals(Environments.QA)){
            cookie.setDomain(serverDomain);
        }
        return cookie;
    }
}
