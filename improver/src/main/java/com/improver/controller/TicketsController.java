package com.improver.controller;

import com.improver.entity.Support;
import com.improver.entity.Ticket;
import com.improver.enums.Priority;
import com.improver.exception.NotFoundException;
import com.improver.model.admin.out.SupportTicket;
import com.improver.model.in.SupportTicketUpdate;
import com.improver.repository.TicketRepository;
import com.improver.security.UserSecurityService;
import com.improver.service.TicketService;
import com.improver.util.annotation.PageableSwagger;
import com.improver.security.annotation.SupportAccess;
import lombok.extern.java.Log;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.data.web.SortDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import javax.validation.Valid;


import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static com.improver.application.properties.Path.*;

@Log
@RestController
@RequestMapping(TICKETS_PATH)
public class TicketsController {

    @Autowired private TicketRepository ticketRepository;
    @Autowired private TicketService ticketService;
    @Autowired private UserSecurityService userSecurityService;


    @SupportAccess
    @PageableSwagger
    @GetMapping
    public ResponseEntity<Page<SupportTicket>> getAll(@RequestParam(required = false) Long id,
                                               @RequestParam(required = false) String email,
                                               @RequestParam(required = false) String name,
                                               @RequestParam(required = false) String businessName,
                                               @RequestParam(required = false) Ticket.Option option,
                                               @RequestParam(required = false) Ticket.Status status,
                                               @RequestParam(required = false) Priority priority,
                                               @RequestParam(required = false) String assignee,
                                               @RequestParam(required = false) boolean unassignedOnly,
                                               @PageableDefault(sort = "created", direction = Sort.Direction.DESC) Pageable pageRequest) {
        List<Ticket.Status> statuses = status != null ? Collections.singletonList(status) : null;
        Page<SupportTicket> tickets = ticketRepository.getAll(id, email, name, businessName, option,
            statuses, priority, assignee, unassignedOnly, pageRequest);
        return new ResponseEntity<>(tickets, HttpStatus.OK);
    }

    @SupportAccess
    @PageableSwagger
    @GetMapping("/my")
    public ResponseEntity<Page<SupportTicket>> getMy(@RequestParam(required = false) Long id,
                                                     @RequestParam(required = false) String email,
                                                     @RequestParam(required = false) String name,
                                                     @RequestParam(required = false) String businessName,
                                                     @RequestParam(required = false) Ticket.Option option,
                                                     @RequestParam(required = false) Priority priority,
                                                     @PageableDefault(direction = Sort.Direction.DESC)
                                                     @SortDefault.SortDefaults({
                                                         @SortDefault(sort = "status", direction = Sort.Direction.DESC),
                                                         @SortDefault(sort = "priority", direction = Sort.Direction.ASC)
                                                     }) Pageable pageRequest) {
        Support support = (Support) userSecurityService.currentUserOrNull();
        Page<SupportTicket> tickets = ticketRepository.getAll(id, email, name, businessName, option,
            Ticket.Status.getActive(), priority, support.getEmail(), false, pageRequest);
        return new ResponseEntity<>(tickets, HttpStatus.OK);

    }

    @PostMapping
    public ResponseEntity<Void> add(@RequestBody @Valid Ticket ticket) {
        ticketService.add(ticket);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @SupportAccess
    @PatchMapping(value = ID_PATH_VARIABLE + "/status")
    public ResponseEntity<Void> changeStatus(@PathVariable long id, @RequestBody String status) {
        Ticket ticket = ticketRepository.findById(id)
            .orElseThrow(NotFoundException::new);
        ticketService.changeStatus(ticket, Ticket.Status.valueOf(status));
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @SupportAccess
    @PutMapping(value = ID_PATH_VARIABLE)
    public ResponseEntity<Void> update(@PathVariable long id, @RequestBody @Valid SupportTicketUpdate supportTicket) {
        ticketService.update(supportTicket);
        return new ResponseEntity<>(HttpStatus.OK);
    }

}
