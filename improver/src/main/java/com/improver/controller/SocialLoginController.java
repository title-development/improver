package com.improver.controller;

import com.improver.entity.SocialConnection;
import com.improver.entity.User;
import com.improver.model.out.LoginModel;
import com.improver.security.JwtUtil;
import com.improver.security.UserSecurityService;
import com.improver.service.FacebookSocialService;
import com.improver.service.GoogleSocialService;
import com.improver.service.SocialConnectionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletResponse;
import java.util.List;

import static com.improver.application.properties.Path.SOCIAL_LOGIN_PATH;
import static com.improver.security.SecurityProperties.AUTHORIZATION_HEADER_NAME;
import static com.improver.security.SecurityProperties.BEARER_TOKEN_PREFIX;


@RestController
@RequestMapping(SOCIAL_LOGIN_PATH)
public class SocialLoginController {

    @Autowired private FacebookSocialService facebookSocialService;
    @Autowired private UserSecurityService userSecurityService;
    @Autowired private GoogleSocialService googleSocialService;
    @Autowired private SocialConnectionService socialConnectionService;

    @PostMapping("/facebook")
    public ResponseEntity<LoginModel> facebook(@RequestBody String accessToken, HttpServletResponse res) {
        User user = facebookSocialService.login(accessToken);
        LoginModel loginModel = userSecurityService.performUserLogin(user, res);
        return new ResponseEntity<>(loginModel, HttpStatus.OK);
    }

    @DeleteMapping("/facebook")
    public ResponseEntity<Void> disconnectFacebook() {
        socialConnectionService.disconnectSocial(SocialConnection.Provider.FACEBOOK);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PostMapping("/facebook/connect")
    public ResponseEntity<Void> facebookConnect(@RequestBody String accessToken) {
        facebookSocialService.connect(accessToken);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PostMapping("/google")
    public ResponseEntity<LoginModel> google(@RequestBody String tokenId, HttpServletResponse res) {
        User user = googleSocialService.login(tokenId);
        LoginModel loginModel = userSecurityService.performUserLogin(user, res);
        return new ResponseEntity<>(loginModel, HttpStatus.OK);
    }

    @DeleteMapping("/google")
    public ResponseEntity<Void> disconnectGoogle() {
        socialConnectionService.disconnectSocial(SocialConnection.Provider.GOOGLE);

        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PostMapping("/google/connect")
    public ResponseEntity<LoginModel> googleConnect(@RequestBody String tokenId) {
        googleSocialService.connect(tokenId);

        return new ResponseEntity<>(HttpStatus.OK);
    }


    @GetMapping()
    public ResponseEntity<List<SocialConnection>> getConnections() {
        List<SocialConnection> socialConnections = socialConnectionService.getSocialConnections();
        return new ResponseEntity<>(socialConnections, HttpStatus.OK);
    }


}

