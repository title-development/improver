package com.improver.service;

import com.improver.entity.Invitation;
import com.improver.entity.Staff;
import com.improver.exception.NotFoundException;
import com.improver.exception.ValidationException;
import com.improver.model.ContractorInvitation;
import com.improver.repository.InvitationRepository;
import com.improver.repository.UserRepository;
import com.improver.util.mail.MailService;
import lombok.extern.slf4j.Slf4j;
import org.apache.tomcat.util.buf.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.LinkedList;
import java.util.List;

import static com.improver.application.properties.BusinessProperties.MAX_INVITATION_BONUS;
import static com.improver.application.properties.BusinessProperties.MIN_INVITATION_BONUS;

@Slf4j
@Service
public class InvitationService {

    @Autowired private InvitationRepository invitationRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private MailService mailService;
    @Autowired private StaffActionLogger staffActionLogger;

    public String[] create(ContractorInvitation invitation, Staff currentStaff) {
        if(invitation.getBonus() < MIN_INVITATION_BONUS || invitation.getBonus() > MAX_INVITATION_BONUS) {
            throw new ValidationException("The bonus amount is out of limits (" + MIN_INVITATION_BONUS / 100 + " - " + MAX_INVITATION_BONUS / 100 + " )");
        }
        String [] allowedEmails = userRepository.checkAvailableToInviteEmails(StringUtils.join(invitation.getEmails()));
        List<Invitation> created = new LinkedList<>();
        for (String email : allowedEmails) {
            created.add(new Invitation(email, invitation.getBonus(), invitation.getDescription()));
        }
        if (allowedEmails.length == 0){
            throw new ValidationException("No valid emails where specified");
        }
        invitationRepository.saveAll(created);
        staffActionLogger.logCreateInvitation(currentStaff, allowedEmails, invitation.getBonus());
        mailService.sendInvitations(invitation.getBonus(), allowedEmails);
        return allowedEmails;
    }

    public void resend(Invitation invitation) {
        mailService.sendInvitations(invitation.getBonus(), invitation.getEmail());
    }

    public void delete(long id, Staff currentStaff) {
        Invitation invitation = invitationRepository.findByIdAndActivatedIsNull(id).orElseThrow(NotFoundException::new);
        invitationRepository.delete(invitation);
        staffActionLogger.logRemoveInvitation(currentStaff, invitation.getEmail());
    }
}
