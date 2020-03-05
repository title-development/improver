package com.improver.model.admin.out;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.improver.entity.Project;
import com.improver.entity.ProjectRequest;
import com.improver.entity.Refund;
import com.improver.model.out.UserModel;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;

import static com.improver.util.serializer.SerializationUtil.DATE_TIME_PATTERN;

@Data
@NoArgsConstructor
public class AdminProjectRequest {
    private long id;
    private ProjectRequest.Status status;
    private ProjectRequest.Reason reason;
    private String reasonComment;
    private Boolean isManual;
    private String serviceType;
    private long projectId;
    private Project.Status projectStatus;
    private Boolean isRefund;
    private UserModel customer;
    private UserModel contractor;
    @JsonFormat(pattern = DATE_TIME_PATTERN)
    private ZonedDateTime created;
    @JsonFormat(pattern = DATE_TIME_PATTERN)
    private ZonedDateTime updated;

    public AdminProjectRequest(ProjectRequest projectRequest, Project project, Refund refund) {
        this.id = projectRequest.getId();
        this.status = projectRequest.getStatus();
        this.reason = projectRequest.getReason();
        this.reasonComment = projectRequest.getReasonComment();
        this.isManual = projectRequest.isManual();
        this.projectId = project.getId();
        this.serviceType =  project.getServiceType().getName();
        this.projectStatus = project.getStatus();
        this.customer = UserModel.of(projectRequest.getProject().getCustomer());
        this.contractor = UserModel.of(projectRequest.getContractor());
        this.isRefund = refund != null;
        this.created = projectRequest.getCreated();
        this.updated = projectRequest.getUpdated();
    }
}
