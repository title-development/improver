package com.improver.controller;

import com.improver.security.annotation.AdminAccess;
import com.improver.service.ManualRunJobService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import static com.improver.application.properties.Path.*;

@Slf4j
@RestController
@RequestMapping(JOB_PATH)
public class JobController {

    @Autowired private ManualRunJobService manualRunJobService;

    @AdminAccess
    @PostMapping("/updateSubscription")
    public ResponseEntity<Void> runUpdateSubscription() {
        manualRunJobService.runUpdateSubscription();
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @AdminAccess
    @PostMapping("/publishReview")
    public ResponseEntity<Void> runPublishReview() {
        manualRunJobService.runPublishReview();
        return new ResponseEntity<>(HttpStatus.OK);
    }
}
