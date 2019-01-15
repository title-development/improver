package com.improver.service;

import com.improver.entity.Invitation;
import com.improver.exception.ValidationException;
import com.improver.model.ContractorInvitation;
import com.improver.repository.InvitationRepository;
import com.improver.repository.UserRepository;
import com.improver.util.mail.MailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class InvitationService {

    public static final int MIN_ALLOWED_BONUS = 10000;
    public static final int MAX_ALLOWED_BONUS = 99900;

    @Autowired private InvitationRepository invitationRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private MailService mailService;

    public void post(ContractorInvitation contractorInvitation) {
        if(contractorInvitation.getBonus() < MIN_ALLOWED_BONUS || contractorInvitation.getBonus() > MAX_ALLOWED_BONUS) {
            throw new ValidationException("The bonus amount is out of limits (" + MIN_ALLOWED_BONUS  / 100 + " - " + MAX_ALLOWED_BONUS / 100 + " )");
        }
        if(userRepository.findByEmail(contractorInvitation.getEmail()).isPresent()) {
            throw new ValidationException("User with current email is already exist");
        }
        if(invitationRepository.findByEmail(contractorInvitation.getEmail()).isPresent()) {
            throw new ValidationException("Invitation for current user is already exist");
        }
        invitationRepository.save(Invitation.of(contractorInvitation));
        mailService.sendInvitation(contractorInvitation.getEmail(), contractorInvitation.getBonus());
    }

    public void resend(Invitation invitation) {
        mailService.sendInvitation(invitation.getEmail(), invitation.getBonus());
    }
}
