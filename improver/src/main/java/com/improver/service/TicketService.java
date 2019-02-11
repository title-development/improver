package com.improver.service;

import com.improver.entity.Staff;
import com.improver.entity.Ticket;
import com.improver.entity.User;
import com.improver.exception.NotFoundException;
import com.improver.exception.ValidationException;
import com.improver.model.admin.out.StaffTicket;
import com.improver.model.in.StaffTicketUpdate;
import com.improver.repository.TicketRepository;
import com.improver.repository.UserRepository;
import com.improver.security.UserSecurityService;
import com.improver.util.mail.MailService;
import lombok.extern.java.Log;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.ZonedDateTime;

@Log
@Service
public class TicketService {

    @Autowired private TicketRepository ticketRepository;
    @Autowired private MailService mailService;
    @Autowired private UserSecurityService userSecurityService;
    @Autowired private UserRepository userRepository;

    public void add(Ticket ticket) {
        if (!Ticket.Subject.getForUsers().contains(ticket.getSubject())) {
            throw new ValidationException("Subject '" + ticket.getSubject() + "' is not allowed");
        }
        User user = userSecurityService.currentUserOrNull();
        if (user != null) {
            ticket.setAuthor(user);
        }
        ticketRepository.save(ticket);
        if (!ticket.getSubject().equals(Ticket.Subject.FEEDBACK)) {
            mailService.sendTicketSubmitted(ticket);
        }
    }

    public void changeStatus(Ticket ticket, Ticket.Status status) {
        Staff staff = userSecurityService.currentStaffOrNull();
        boolean isClosed = ticket.getStatus().equals(Ticket.Status.CLOSED);
        boolean isNew = ticket.getStatus().equals(Ticket.Status.NEW);
        boolean isClosing =  status.equals(Ticket.Status.CLOSED);
        boolean notMy = ticket.getAssignee() != null && !ticket.getAssignee().getEmail().equals(staff.getEmail());
        if (isClosed || isNew && isClosing || notMy) {
            throw new ValidationException("Operation is not permitted");
        }
        boolean startingUnassigned = status == Ticket.Status.IN_PROGRESS && (ticket.getAssignee() == null);
        if (startingUnassigned) {
            ticket.setAssignee(staff);
        }
        ticket.setStatus(status);
        ticket.setUpdated(ZonedDateTime.now());
        ticketRepository.save(ticket);
    }

    public void update(StaffTicketUpdate staffTicket) {
        Staff staff = userSecurityService.currentStaffOrNull();
        Ticket toUpdate = ticketRepository.findById(staffTicket.getId())
            .orElseThrow(NotFoundException::new);
        toUpdate.setPriority(staffTicket.getPriority());
        toUpdate.setUpdated(ZonedDateTime.now());
        String assignee = staffTicket.getAssigneeEmail();
        boolean unassignedOrOwner = toUpdate.getAssignee() == null
            || toUpdate.getAssignee().getEmail().equals(staff.getEmail());
        if(unassignedOrOwner || staff.getRole() == User.Role.ADMIN) {
            if (assignee != null) {
                toUpdate.setAssignee((Staff) userRepository.findByEmail(assignee)
                    .orElseThrow(ValidationException::new));
            } else {
                toUpdate.setAssignee(null);
            }
        }
        ticketRepository.save(toUpdate);
    }

    public void addByStaff(StaffTicket staffTicket, Staff currentStaff) {
        Ticket ticket = new Ticket()
            .setEmail(staffTicket.getEmail())
            .setName(staffTicket.getName())
            .setBusinessName(staffTicket.getBusinessName())
            .setDescription(staffTicket.getDescription())
            .setPriority(staffTicket.getPriority())
            .setSubject(staffTicket.getSubject())
            .setAuthor(currentStaff);
        String assignee = staffTicket.getAssigneeEmail();
        if (assignee != null) {
            ticket.setAssignee((Staff) userRepository.findByEmail(assignee)
                .orElseThrow(ValidationException::new));
        }
        ticketRepository.save(ticket);
    }


}
