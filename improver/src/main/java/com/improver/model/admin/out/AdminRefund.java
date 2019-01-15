package com.improver.model.admin.out;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.improver.entity.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

import java.time.ZonedDateTime;
import java.util.List;

import static com.improver.util.serializer.SerializationUtil.DATE_TIME_PATTERN;

@Data
@NoArgsConstructor
@Accessors(chain = true)
public class AdminRefund {

    private long id;
    private String comment;
    private String notes;
    private Refund.Issue issue;
    private Refund.Option option;
    private Refund.Status status;
    @JsonFormat(pattern = DATE_TIME_PATTERN)
    private ZonedDateTime created;
    @JsonFormat(pattern = DATE_TIME_PATTERN)
    private ZonedDateTime updated;
    private String customer;
    private String contractor;
    private long projectRequestId;
    private long projectId;
    private List<RefundAction> refundActions;

    public AdminRefund(Refund refund, long projectRequestId, long projectId, String customer, String contractor) {
        this.id = refund.getId();
        this.comment = refund.getComment();
        this.notes = refund.getNotes();
        this.issue = refund.getIssue();
        this.option = refund.getOption();
        this.status = refund.getStatus();
        this.created = refund.getCreated();
        this.updated = refund.getUpdated();
        this.projectId = projectId;
        this.projectRequestId = projectRequestId;
        this.customer = customer;
        this.contractor = contractor;
    }

    public static AdminRefund from(Refund refund) {
        ProjectRequest projectRequest = refund.getProjectRequest();
        Project project = projectRequest.getProject();
        return new AdminRefund().setId(refund.getId())
            .setComment(refund.getComment())
            .setNotes(refund.getNotes())
            .setIssue(refund.getIssue())
            .setOption(refund.getOption())
            .setStatus(refund.getStatus())
            .setCreated(refund.getCreated())
            .setUpdated(refund.getUpdated())
            .setProjectId(project.getId())
            .setProjectRequestId(projectRequest.getId())
            .setCustomer(project.getCustomer().getEmail())
            .setContractor(projectRequest.getContractor().getEmail());
    }

    public static AdminRefund full(Refund refund) {
        return from(refund)
            .setRefundActions(refund.getRefundActions());
    }

}
