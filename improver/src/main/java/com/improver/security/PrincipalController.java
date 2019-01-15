package com.improver.security;

import com.improver.model.out.LoginModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import static com.improver.application.properties.Path.PRINCIPAL_PATH;

@RestController
@RequestMapping(PRINCIPAL_PATH)
public class PrincipalController {

    @Autowired private UserSecurityService userSecurityService;

    @GetMapping
    public ResponseEntity<LoginModel> getCurrentPrincipal() {
        return new ResponseEntity<>(userSecurityService.getCurrentPrincipal(), HttpStatus.OK);
    }
}
