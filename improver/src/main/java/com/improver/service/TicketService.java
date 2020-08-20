package com.improver.service;

import com.improver.entity.*;
import com.improver.exception.NotFoundException;
import com.improver.exception.ValidationException;
import com.improver.model.admin.out.StaffTicket;
import com.improver.model.in.StaffTicketUpdate;
import com.improver.repository.TicketRepository;
import com.improver.repository.UserRepository;
import com.improver.security.UserSecurityService;
import com.improver.util.mail.MailService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;

@Slf4j
@Service
public class TicketService {

    private final static int COMPANY_PROFILE_TICKETS_LIMIT = 2;

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

    public void changeStatus(Ticket ticket, Ticket.Status status, Staff currentStaff) {
        boolean isClosed = ticket.getStatus().equals(Ticket.Status.CLOSED);
        boolean isNew = ticket.getStatus().equals(Ticket.Status.NEW);
        boolean isClosing =  status.equals(Ticket.Status.CLOSED);
        boolean notMy = ticket.getAssignee() != null && !ticket.getAssignee().getEmail().equals(currentStaff.getEmail());
        if (isClosed || ((isNew && isClosing || notMy) && currentStaff.getRole() != User.Role.ADMIN)) {
            throw new ValidationException("Operation is not permitted");
        }
        boolean startingUnassigned = status == Ticket.Status.IN_PROGRESS && (ticket.getAssignee() == null);
        if (startingUnassigned) {
            ticket.setAssignee(currentStaff);
        }
        ticket.setStatus(status);
        ticket.setUpdated(ZonedDateTime.now());
        ticketRepository.save(ticket);
        if (startingUnassigned) {
            mailService.sendNewTicketAssignee(ticket);
        }
    }

    public void update(StaffTicketUpdate staffTicket, Staff currentStaff) {
        Ticket toUpdate = ticketRepository.findById(staffTicket.getId())
            .orElseThrow(NotFoundException::new);
        toUpdate.setPriority(staffTicket.getPriority());
        toUpdate.setUpdated(ZonedDateTime.now());
        String assignee = staffTicket.getAssigneeEmail();
        boolean assigned = false;
        boolean unassignedOrOwner = toUpdate.getAssignee() == null
            || toUpdate.getAssignee().getEmail().equals(currentStaff.getEmail());
        if(unassignedOrOwner || currentStaff.getRole() == User.Role.ADMIN) {
            if (assignee != null) {
                toUpdate.setAssignee((Staff) userRepository.findByEmail(assignee)
                    .orElseThrow(() -> new ValidationException("Assignee not found")));
                assigned = true;
            } else {
                toUpdate.setAssignee(null);
            }
        }
        ticketRepository.save(toUpdate);
        if (assigned) {
            mailService.sendNewTicketAssignee(toUpdate);
        }
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
        boolean assigned = false;
        if (assignee != null) {
            ticket.setAssignee((Staff) userRepository.findByEmail(assignee)
                .orElseThrow(() -> new ValidationException("Assignee not found")));
            assigned = true;
        }
        ticketRepository.save(ticket);
        if (assigned) {
            mailService.sendNewTicketAssignee(ticket);
        }
    }

    public void updateName(Contractor contractor, String name) {
        checkCompanyProfileTicketsLimit(contractor.getId());
        Ticket ticket = companyProfileChangeRequest(contractor,
            String.format("Company name change request. New name is - %s", name));
        add(ticket);
    }

    public void updateFounded(Contractor contractor, Integer founded) {
        checkCompanyProfileTicketsLimit(contractor.getId());
        Ticket ticket = companyProfileChangeRequest(contractor,
            String.format("Company foundation year change request. New foundation year is - %s", founded));
        add(ticket);
    }

    private void checkCompanyProfileTicketsLimit(long contractorId) {
        int companyProfileTickets = ticketRepository.countAllByStatusInAndAuthorId(Ticket.Status.getActive(), contractorId);
        if(companyProfileTickets >= COMPANY_PROFILE_TICKETS_LIMIT) {
            throw new ValidationException("You already requested Company name/year change");
        }
    }

    private Ticket companyProfileChangeRequest(Contractor contractor, String description) {
        Company company = contractor.getCompany();
        return new Ticket().setName(contractor.getDisplayName())
            .setBusinessName(company.getName())
            .setCreated(ZonedDateTime.now())
            .setEmail(contractor.getEmail())
            .setSubject(Ticket.Subject.COMPANY_PROFILE)
            .setDescription(description);
    }

}
