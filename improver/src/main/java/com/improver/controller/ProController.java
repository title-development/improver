package com.improver.controller;

import com.improver.exception.NotFoundException;
import com.improver.model.QuickReply;
import com.improver.repository.ContractorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import static com.improver.application.properties.Path.ID_PATH_VARIABLE;
import static com.improver.application.properties.Path.PROS_PATH;


@RestController
@RequestMapping(PROS_PATH)
public class ProController {

    @Autowired private ContractorRepository contractorRepository;

    @GetMapping(ID_PATH_VARIABLE + "/quickreply")
    public ResponseEntity<QuickReply> getQuickreply(@PathVariable("id") long contractorId) {
        QuickReply quickReply = contractorRepository.getQuickReply(contractorId);
        if(quickReply == null) {
            throw new NotFoundException();
        }
        return new ResponseEntity<>(quickReply, HttpStatus.OK);
    }

    @PutMapping(ID_PATH_VARIABLE + "/quickreply")
    public ResponseEntity<Void> updateQuickreply(@PathVariable("id") long id, @RequestBody QuickReply quickReply) {
        contractorRepository.updateQuickReply(id, quickReply.isEnabled(), quickReply.getText());
        return new ResponseEntity<>(HttpStatus.OK);
    }

}
