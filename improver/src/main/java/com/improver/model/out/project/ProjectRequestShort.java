package com.improver.model.out.project;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.improver.entity.Customer;
import com.improver.entity.ProjectRequest;
import com.improver.entity.Project;
import com.improver.model.out.UserModel;
import lombok.Getter;

import java.time.ZonedDateTime;

import static com.improver.util.serializer.SerializationUtil.DATE_TIME_PATTERN;

@Getter
public class ProjectRequestShort {

    private long id;
    private long projectId;
    protected UserModel customer;
    private String serviceType;
    private Project.Status projectStatus;
    @JsonFormat(pattern = DATE_TIME_PATTERN)
    private ZonedDateTime created;
    @JsonFormat(pattern = DATE_TIME_PATTERN)
    private ZonedDateTime updated;
    private ProjectRequest.Status status;

    private boolean isManual;
    private boolean isRefundRequested;
    private boolean isRefundable;
    private Long unreadMessages;


    public ProjectRequestShort(Project project, String serviceName, Customer customer, ProjectRequest projectRequest, Long refundId){
        this.id = projectRequest.getId();
        this.projectId = project.getId();
        this.customer = new UserModel(0, customer.getDisplayName(), customer.getIconUrl());
        this.serviceType = serviceName;
        this.projectStatus = project.getStatus();
        this.created = projectRequest.getCreated();
        this.updated = projectRequest.getUpdated();
        this.status = projectRequest.getStatus();
        this.isManual = projectRequest.isManual();
        this.isRefundable = projectRequest.isRefundable();
        this.isRefundRequested = refundId != null;
    }

    public void setUnreadMessages(Long unreadMessages) {
        this.unreadMessages = unreadMessages;
    }
}
