package com.improver.controller;

import com.improver.entity.Staff;
import com.improver.entity.Ticket;
import com.improver.enums.Priority;
import com.improver.exception.NotFoundException;
import com.improver.model.admin.out.StaffTicket;
import com.improver.model.in.StaffTicketUpdate;
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


import java.util.Collections;
import java.util.List;

import static com.improver.application.properties.Path.*;

@Log
@RestController
@RequestMapping(TICKETS_PATH)
public class TicketController {

    @Autowired private TicketRepository ticketRepository;
    @Autowired private TicketService ticketService;
    @Autowired private UserSecurityService userSecurityService;


    @SupportAccess
    @PageableSwagger
    @GetMapping
    public ResponseEntity<Page<StaffTicket>> getAll(@RequestParam(required = false) Long id,
                                                    @RequestParam(required = false) String email,
                                                    @RequestParam(required = false) String name,
                                                    @RequestParam(required = false) String businessName,
                                                    @RequestParam(required = false) Ticket.Subject subject,
                                                    @RequestParam(required = false) Ticket.Status status,
                                                    @RequestParam(required = false) Priority priority,
                                                    @RequestParam(required = false) String assignee,
                                                    @RequestParam(required = false) String author,
                                                    @RequestParam(required = false) boolean unassignedOnly,
                                                    @PageableDefault(sort = "created", direction = Sort.Direction.DESC) Pageable pageRequest) {
        List<Ticket.Status> statuses = status != null ? Collections.singletonList(status) : null;
        Page<StaffTicket> tickets = ticketRepository.getAll(id, email, name, businessName, subject,
            statuses, priority, assignee, author, unassignedOnly, pageRequest);
        return new ResponseEntity<>(tickets, HttpStatus.OK);
    }

    @SupportAccess
    @PageableSwagger
    @GetMapping("/my")
    public ResponseEntity<Page<StaffTicket>> getMy(@RequestParam(required = false) Long id,
                                                   @RequestParam(required = false) String email,
                                                   @RequestParam(required = false) String name,
                                                   @RequestParam(required = false) String businessName,
                                                   @RequestParam(required = false) Ticket.Subject subject,
                                                   @RequestParam(required = false) Priority priority,
                                                   @RequestParam(required = false) String author,
                                                   @PageableDefault(direction = Sort.Direction.DESC)
                                                     @SortDefault.SortDefaults({
                                                         @SortDefault(sort = "status", direction = Sort.Direction.DESC),
                                                         @SortDefault(sort = "priority", direction = Sort.Direction.ASC)
                                                     }) Pageable pageRequest) {
        Staff staff = userSecurityService.currentStaffOrNull();
        Page<StaffTicket> tickets = ticketRepository.getAll(id, email, name, businessName, subject,
            Ticket.Status.getActive(), priority, staff.getEmail(), author,false, pageRequest);
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
    public ResponseEntity<Void> update(@PathVariable long id, @RequestBody @Valid StaffTicketUpdate supportTicket) {
        ticketService.update(supportTicket);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PostMapping("/staff")
    @SupportAccess
    public ResponseEntity<Void> add(@RequestBody @Valid StaffTicket ticket) {
        ticketService.addByStaff(ticket, userSecurityService.currentStaffOrNull());
        return new ResponseEntity<>(HttpStatus.OK);
    }

}
