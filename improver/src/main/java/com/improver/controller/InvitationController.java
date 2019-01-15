package com.improver.controller;

import com.improver.entity.Company;
import com.improver.entity.Invitation;
import com.improver.exception.NotFoundException;
import com.improver.model.ContractorInvitation;
import com.improver.repository.InvitationRepository;
import com.improver.security.annotation.AdminAccess;
import com.improver.security.annotation.SupportAccess;
import com.improver.service.InvitationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import static com.improver.application.properties.Path.ID_PATH_VARIABLE;
import static com.improver.application.properties.Path.INVITATIONS_PATH;

@RestController
@RequestMapping(INVITATIONS_PATH)
public class InvitationController {

    @Autowired private InvitationRepository invitationRepository;
    @Autowired private InvitationService invitationService;

    @SupportAccess
    @GetMapping
    public ResponseEntity<Page<Invitation>> getInvitations(
        @RequestParam(required = false) Long id,
        @RequestParam(required = false) String email,
        @RequestParam(required = false) Integer bonusFrom,
        @RequestParam(required = false) Integer bonusTo,
        @PageableDefault(sort = "created", direction = Sort.Direction.DESC) Pageable pageRequest) {
        Page<Invitation> invitations = invitationRepository.getAll(id, email, bonusFrom, bonusTo, pageRequest);
        return new ResponseEntity<>(invitations, HttpStatus.OK);
    }

    @AdminAccess
    @PostMapping
    public ResponseEntity<Void> post(@RequestBody ContractorInvitation contractorInvitation) {
        invitationService.post(contractorInvitation);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @AdminAccess
    @DeleteMapping(ID_PATH_VARIABLE)
    public ResponseEntity<Void> delete(@PathVariable long id) {
        Invitation invitation = invitationRepository.findById(id).orElseThrow(NotFoundException::new);
        invitationRepository.delete(invitation);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @AdminAccess
    @PostMapping(ID_PATH_VARIABLE + "/resend")
    public ResponseEntity<Void> resend(@PathVariable long id) {
        Invitation invitation = invitationRepository.findByIdAndActivatedIsNull(id).orElseThrow(NotFoundException::new);
        invitationService.resend(invitation);
        return new ResponseEntity<>(HttpStatus.OK);
    }

}
