package com.improver.controller;

import com.improver.entity.SocialConnection;
import com.improver.entity.User;
import com.improver.model.out.LoginModel;
import com.improver.model.socials.SocialUserInfo;
import com.improver.security.UserSecurityService;
import com.improver.service.FacebookSocialService;
import com.improver.service.GoogleSocialService;
import com.improver.service.SocialConnectionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletResponse;
import javax.validation.Valid;
import java.util.List;

import static com.improver.application.properties.Path.SOCIAL_LOGIN_PATH;


@RestController
@RequestMapping(SOCIAL_LOGIN_PATH)
public class SocialLoginController {

    @Autowired private FacebookSocialService facebookSocialService;
    @Autowired private UserSecurityService userSecurityService;
    @Autowired private GoogleSocialService googleSocialService;
    @Autowired private SocialConnectionService socialConnectionService;

    @PostMapping("/facebook")
    public ResponseEntity<LoginModel> loginOrRegisterWithFacebook(@RequestBody @Valid SocialUserInfo socialUserInfo, HttpServletResponse res) {
        User user = facebookSocialService.loginOrRegister(socialUserInfo);
        LoginModel loginModel = userSecurityService.performUserLogin(user, res);
        return new ResponseEntity<>(loginModel, HttpStatus.OK);
    }

    @PostMapping("/facebook/pro")
    public ResponseEntity<LoginModel> registerProWithFacebook(@RequestBody @Valid SocialUserInfo socialUserInfo, HttpServletResponse res) {
        User user = facebookSocialService.registerPro(socialUserInfo);
        LoginModel loginModel = userSecurityService.performUserLogin(user, res);
        return new ResponseEntity<>(loginModel, HttpStatus.OK);
    }

    @DeleteMapping("/facebook")
    public ResponseEntity<Void> disconnectFacebook() {
        User user = userSecurityService.currentUser();
        socialConnectionService.disconnectSocial(user, SocialConnection.Provider.FACEBOOK);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PostMapping("/facebook/connect")
    public ResponseEntity<Void> connectFacebook(@RequestBody String accessToken) {
        User user = userSecurityService.currentUser();
        facebookSocialService.connect(user, accessToken);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PostMapping("/google")
    public ResponseEntity<LoginModel> loginOrRegisterWithGoogle(@RequestBody @Valid SocialUserInfo socialUserInfo, HttpServletResponse res) {
        User user = googleSocialService.loginOrRegister(socialUserInfo.getAccessToken());
        LoginModel loginModel = userSecurityService.performUserLogin(user, res);
        return new ResponseEntity<>(loginModel, HttpStatus.OK);
    }

    @PostMapping("/google/pro")
    public ResponseEntity<LoginModel> registerProWithGoogle(@RequestBody SocialUserInfo socialUserInfo, HttpServletResponse res) {
        User user = googleSocialService.registerPro(socialUserInfo);
        LoginModel loginModel = userSecurityService.performUserLogin(user, res);
        return new ResponseEntity<>(loginModel, HttpStatus.OK);
    }

    @DeleteMapping("/google")
    public ResponseEntity<Void> disconnectGoogle() {
        User user = userSecurityService.currentUser();
        socialConnectionService.disconnectSocial(user, SocialConnection.Provider.GOOGLE);

        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PostMapping("/google/connect")
    public ResponseEntity<LoginModel> connectGoogle(@RequestBody String tokenId) {
        User user = userSecurityService.currentUser();
        googleSocialService.connect(user, tokenId);

        return new ResponseEntity<>(HttpStatus.OK);
    }

    @GetMapping()
    public ResponseEntity<List<SocialConnection>> getConnections() {
        User user = userSecurityService.currentUser();
        List<SocialConnection> socialConnections = socialConnectionService.getSocialConnections(user);
        return new ResponseEntity<>(socialConnections, HttpStatus.OK);
    }


}

