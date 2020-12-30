package com.improver.controller;

import com.improver.entity.Refund;
import com.improver.entity.RefundAction;
import com.improver.entity.User;
import com.improver.exception.ConflictException;
import com.improver.exception.NotFoundException;
import com.improver.model.admin.out.AdminRefund;
import com.improver.repository.RefundActionRepository;
import com.improver.repository.RefundRepository;
import com.improver.security.UserSecurityService;
import com.improver.service.RefundService;
import com.improver.util.annotation.PageableSwagger;
import com.improver.security.annotation.SupportAccess;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.ZonedDateTime;
import java.util.List;

import static com.improver.entity.Refund.Status.IN_REVIEW;
import static com.improver.application.properties.Path.ACTIONS;
import static com.improver.application.properties.Path.ID_PATH_VARIABLE;
import static com.improver.application.properties.Path.REFUND_PATH;

@RestController
@RequestMapping(REFUND_PATH)
public class RefundController {

    @Autowired private RefundRepository refundRepository;
    @Autowired private RefundService refundService;
    @Autowired private UserSecurityService userSecurityService;
    @Autowired private RefundActionRepository refundActionRepository;

    @SupportAccess
    @PageableSwagger
    @GetMapping
    public ResponseEntity<Page<AdminRefund>> getAll(
        @RequestParam(required = false) Long id,
        @RequestParam(required = false) String contractorEmail,
        @RequestParam(required = false) String customerEmail,
        @RequestParam(required = false) Refund.Issue issue,
        @RequestParam(required = false) Refund.Option option,
        @RequestParam(required = false) Refund.Status status,
        @RequestParam(required = false) ZonedDateTime createdFrom,
        @RequestParam(required = false) ZonedDateTime createdTo,
        @RequestParam(required = false) ZonedDateTime updatedFrom,
        @RequestParam(required = false) ZonedDateTime updatedTo,
        @PageableDefault(sort = "id", direction = Sort.Direction.ASC) Pageable pageRequest) {
        Page<AdminRefund> refunds = refundRepository.getAll(id, contractorEmail, customerEmail, issue, option, status,
            createdFrom, createdTo, updatedFrom, updatedTo, pageRequest);
        return new ResponseEntity<>(refunds, HttpStatus.OK);
    }

    @SupportAccess
    @GetMapping(ID_PATH_VARIABLE)
    public ResponseEntity<AdminRefund> getRefund(@PathVariable long id) {
        Refund refund = refundRepository.findById(id).orElseThrow(NotFoundException::new);
        return new ResponseEntity<>(AdminRefund.full(refund), HttpStatus.OK);
    }

    @SupportAccess
    @GetMapping(ID_PATH_VARIABLE + ACTIONS)
    public ResponseEntity<List<RefundAction>> getRefundActions(@PathVariable long id) {
        List<RefundAction> refundActionList = refundActionRepository.findAllByRefund_Id(id);
        return new ResponseEntity<>(refundActionList, HttpStatus.OK);
    }

    @SupportAccess
    @PostMapping(ID_PATH_VARIABLE + ACTIONS)
    public ResponseEntity<Void> actions(@PathVariable long id, @RequestParam RefundAction.Action action, @RequestBody String comment) {
        Refund refund = refundRepository.findById(id).orElseThrow(NotFoundException::new);
        if (refund.getStatus() != IN_REVIEW) {
            throw new ConflictException("Action allowed only for refunds with status IN_REVIEW");
        }

        switch (action) {
            case APPROVE:
                refundService.approve(refund, comment);
                break;
            case REJECT:
                refundService.reject(refund, comment);
                break;
            case COMMENT:
                refundService.updateComment(refund, comment);
                break;
            default:
                throw new IllegalArgumentException(action + " is not allowed refund action");
        }

        User support = userSecurityService.currentUser();

        refundActionRepository.save(new RefundAction()
            .setText(comment)
            .setAction(action)
            .setCreated(ZonedDateTime.now())
            .setRefund(refund)
            .setAuthor(support.getEmail()));

        return new ResponseEntity<>(HttpStatus.OK);
    }

}
