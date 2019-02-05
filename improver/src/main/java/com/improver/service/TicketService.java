package com.improver.service;

import com.improver.entity.Staff;
import com.improver.entity.Support;
import com.improver.entity.Ticket;
import com.improver.entity.User;
import com.improver.exception.NotFoundException;
import com.improver.exception.ValidationException;
import com.improver.model.in.SupportTicketUpdate;
import com.improver.repository.TicketRepository;
import com.improver.repository.UserRepository;
import com.improver.security.UserSecurityService;
import com.improver.util.mail.MailService;
import lombok.extern.java.Log;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;

import static com.improver.util.serializer.SerializationUtil.ASSIGNEE_NAME_EXTRACT;

@Log
@Service
public class TicketService {

    @Autowired private TicketRepository ticketRepository;
    @Autowired private MailService mailService;
    @Autowired private UserSecurityService userSecurityService;
    @Autowired private UserRepository userRepository;

    public void add(Ticket ticket) {
        if (!ticket.getOption().equals(Ticket.Option.FEEDBACK)) {
            mailService.sendTicketSubmitted(ticket);
        }
        ticketRepository.save(ticket);
    }




    public void changeStatus(Ticket ticket, Ticket.Status status) {
        User currentUser = userSecurityService.currentUserOrNull();
        boolean isClosed = ticket.getStatus().equals(Ticket.Status.CLOSED);
        boolean isNew = ticket.getStatus().equals(Ticket.Status.NEW);
        boolean isClosing =  status.equals(Ticket.Status.CLOSED);
        boolean notMy = ticket.getAssignee() != null && !ticket.getAssignee().getEmail().equals(currentUser.getEmail());
        if (isClosed || isNew && isClosing || notMy) {
            throw new ValidationException("Operation is not permitted");
        }
        boolean startingUnassigned = status == Ticket.Status.IN_PROGRESS && (ticket.getAssignee() == null);
        if (startingUnassigned) {
            ticket.setAssignee((Support) currentUser);
        }
        ticket.setStatus(status);
        ticket.setUpdated(ZonedDateTime.now());
        ticketRepository.save(ticket);
    }

    public void update(SupportTicketUpdate supportTicket) {
        User currentUser = userSecurityService.currentUserOrNull();
        Ticket toUpdate = ticketRepository.findById(supportTicket.getId())
            .orElseThrow(NotFoundException::new);
        toUpdate.setPriority(supportTicket.getPriority());
        toUpdate.setUpdated(ZonedDateTime.now());
        String assignee = supportTicket.getAssignee();
        boolean unassignedOrOwner = toUpdate.getAssignee() == null
            || toUpdate.getAssignee().getEmail().equals(currentUser.getEmail());
        if(unassignedOrOwner || currentUser.getRole() == User.Role.ADMIN) {
            if (assignee != null) {
                assignee = supportTicket.getAssignee().replaceAll(ASSIGNEE_NAME_EXTRACT, "");
                toUpdate.setAssignee((Staff) userRepository.findByEmail(assignee)
                    .orElseThrow(ValidationException::new));
            } else {
                toUpdate.setAssignee(null);
            }
        }
        ticketRepository.save(toUpdate);
    }
}
