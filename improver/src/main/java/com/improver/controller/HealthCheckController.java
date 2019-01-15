package com.improver.controller;

import com.improver.model.QuickReply;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import static com.improver.application.properties.Path.HEATH_CHECK_PATH;


@RestController
@RequestMapping(HEATH_CHECK_PATH)
public class HealthCheckController {

    public ResponseEntity<QuickReply> healthCheck() {
        return new ResponseEntity<>(HttpStatus.OK);
    }

}
