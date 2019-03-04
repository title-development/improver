package com.improver.service;

import com.improver.entity.Invitation;
import com.improver.entity.Staff;
import com.improver.entity.StaffAction;
import com.improver.exception.NotFoundException;
import com.improver.exception.ValidationException;
import com.improver.model.ContractorInvitation;
import com.improver.repository.InvitationRepository;
import com.improver.repository.StaffActionRepository;
import com.improver.repository.UserRepository;
import com.improver.security.UserSecurityService;
import com.improver.util.mail.MailService;
import lombok.extern.java.Log;
import org.apache.tomcat.util.buf.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.LinkedList;
import java.util.List;

@Log
@Service
public class InvitationService {

    public static final int MIN_ALLOWED_BONUS = 10000;
    public static final int MAX_ALLOWED_BONUS = 99900;

    @Autowired private InvitationRepository invitationRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private MailService mailService;
    @Autowired private UserSecurityService userSecurityService;
    @Autowired private StaffActionRepository staffActionRepository;

    public String[] create(ContractorInvitation invitation, Staff currentStaff) {
        if(invitation.getBonus() < MIN_ALLOWED_BONUS || invitation.getBonus() > MAX_ALLOWED_BONUS) {
            throw new ValidationException("The bonus amount is out of limits (" + MIN_ALLOWED_BONUS  / 100 + " - " + MAX_ALLOWED_BONUS / 100 + " )");
        }
        String [] allowedEmails = userRepository.checkAvailableToInviteEmails(StringUtils.join(invitation.getEmails()));
        List<Invitation> created = new LinkedList<>();
        for (String email : allowedEmails) {
            created.add(new Invitation(email, invitation.getBonus(), invitation.getDescription()));
        }
        invitationRepository.saveAll(created);
        String logDescription = String.format("Invitation for Contractors: %1$s. Amount: $%2$s.", Arrays.toString(allowedEmails), invitation.getBonus() / 100);
        staffActionRepository.save(new StaffAction(currentStaff, logDescription, StaffAction.Action.CREATE_INVITATION));
        mailService.sendInvitations(invitation.getBonus(), allowedEmails);
        return allowedEmails;
    }

    public void resend(Invitation invitation) {
        mailService.sendInvitations(invitation.getBonus(), invitation.getEmail());
    }

    public void delete(long id, Staff currentStaff) {
        Invitation invitation = invitationRepository.findByIdAndActivatedIsNull(id).orElseThrow(NotFoundException::new);
        invitationRepository.delete(invitation);
        String logDescription = String.format("Invitation for Contractor with email: %1$s.", invitation.getEmail());
        staffActionRepository.save(new StaffAction(currentStaff, logDescription, StaffAction.Action.REMOVE_INVITATION));
    }
}
