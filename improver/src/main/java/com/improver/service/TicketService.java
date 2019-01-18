package com.improver.service;

import com.improver.entity.Ticket;
import com.improver.exception.NotFoundException;
import com.improver.repository.TicketRepository;
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

    public void add(Ticket ticket) {
        if (!ticket.getOption().equals(Ticket.Option.FEEDBACK)) {
            mailService.sendTicketSubmitted(ticket.getEmail());
        }
        ticketRepository.save(ticket);
    }

    public void changeStatus(long feedbackId, Ticket.Status status) {
        Ticket ticket = ticketRepository.findById(feedbackId)
            .orElseThrow(NotFoundException::new);
        ticket.setStatus(status);
        ticket.setUpdated(ZonedDateTime.now());
        ticketRepository.save(ticket);
    }

}
