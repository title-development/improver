package com.improver.service;

import com.improver.entity.Ticket;
import com.improver.exception.NotFoundException;
import com.improver.repository.TicketRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;

@Service
public class TicketService {

    private final Logger log = LoggerFactory.getLogger(getClass());

    @Autowired
    private TicketRepository ticketRepository;

    public void add(Ticket ticket) {
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
