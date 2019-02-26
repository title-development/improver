package com.improver.controller;

import com.improver.entity.User;
import com.improver.entity.UserTutorial;
import com.improver.repository.UserTutorialRepository;
import com.improver.security.UserSecurityService;
import com.improver.service.UserTutorialService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

import static com.improver.application.properties.Path.TUTORIALS_PATH;

@RestController
@RequestMapping(TUTORIALS_PATH)
public class UserTutorialsController {
    @Autowired UserSecurityService userSecurityService;
    @Autowired UserTutorialRepository userTutorialRepository;
    @Autowired UserTutorialService userTutorialService;

    @GetMapping
    public ResponseEntity<List<UserTutorial.Tutorial>> getAvailableTutorials() {
        User user = userSecurityService.currentUser();
        List<UserTutorial.Tutorial> tutorials = userTutorialService.getAvailableTutorials(user);

        return new ResponseEntity<>(tutorials, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<Void> completeTutorial(@RequestBody @Valid UserTutorial userTutorial) {
        User user = userSecurityService.currentUser();
        userTutorialService.complete(user, userTutorial.getTutorial());

        return new ResponseEntity<>(HttpStatus.OK);
    }
}
