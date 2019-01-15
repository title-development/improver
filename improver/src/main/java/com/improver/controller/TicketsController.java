package com.improver.controller;

import com.improver.entity.Ticket;
import com.improver.repository.TicketRepository;
import com.improver.service.TicketService;
import com.improver.util.annotation.PageableSwagger;
import com.improver.security.annotation.SupportAccess;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import static com.improver.application.properties.Path.*;

@RestController
@RequestMapping(TICKETS_PATH)
public class TicketsController {

    private final Logger log = LoggerFactory.getLogger(getClass());

    @Autowired
    TicketRepository ticketRepository;
    @Autowired
    TicketService ticketService;


    @SupportAccess
    @PageableSwagger
    @GetMapping
    public ResponseEntity<Page<Ticket>> getAll(@RequestParam(required = false) Long id,
                                               @RequestParam(required = false) String email,
                                               @RequestParam(required = false) String name,
                                               @RequestParam(required = false) String businessName,
                                               @RequestParam(required = false) Ticket.Option option,
                                               @RequestParam(required = false) Ticket.Status status,
                                               @PageableDefault(sort = "created", direction = Sort.Direction.DESC) Pageable pageRequest) {
        Page<Ticket> tickets = ticketRepository.getAll(id, email, name, businessName, option, status, pageRequest);
        return new ResponseEntity<>(tickets, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<Void> add(@RequestBody Ticket ticket) {
        ticketRepository.save(ticket);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @SupportAccess
    @PutMapping(value = ID_PATH_VARIABLE + "/status")
    public ResponseEntity<Void> changeStatus(@PathVariable long id, @RequestBody String status) {
        ticketService.changeStatus(id, Ticket.Status.valueOf(status));
        return new ResponseEntity<>(HttpStatus.OK);
    }


}
