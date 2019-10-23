package com.improver.model.admin.out;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonRawValue;
import com.improver.entity.Location;
import com.improver.entity.Project;
import com.improver.entity.ProjectAction;
import com.improver.model.out.UserModel;
import com.improver.model.out.project.CompanyProjectRequest;
import lombok.Data;
import lombok.experimental.Accessors;

import java.time.ZonedDateTime;
import java.util.List;

import static com.improver.util.serializer.SerializationUtil.DATE_TIME_PATTERN;

@Data
@Accessors(chain = true)
public class AdminProject {
    private long id;
    private String serviceType;
    private UserModel customer;
    private Location location;
    private String startDate;

    @JsonRawValue
    private String details;
    @JsonFormat(pattern = DATE_TIME_PATTERN)
    private ZonedDateTime created;
    @JsonFormat(pattern = DATE_TIME_PATTERN)
    private ZonedDateTime updated;

    private Project.Status status;
    private Project.Reason reason;
    private String reasonDescription;
    private int leadPrice;
    private int freePositions;
    private boolean isLead;
    private String notes;
    private boolean hasProjectRequests;

    private List<CompanyProjectRequest> projectRequests;
    private List<ProjectAction> projectActions;

    public static AdminProject from(Project project){
        return new AdminProject()
            .setId(project.getId())
            .setServiceType(project.getServiceType().getName())
            .setCustomer(UserModel.of(project.getCustomer()))
            .setLocation(project.getLocation())
            .setStartDate(project.getStartDate())
            .setCreated(project.getCreated())
            .setUpdated(project.getUpdated())
            .setStatus(project.getStatus())
            .setReason(project.getReason())
            .setReasonDescription(project.getReasonDescription())
            .setLeadPrice(project.getLeadPrice())
            .setFreePositions(project.getFreePositions())
            .setLead(project.isLead())
            .setNotes(project.getNotes())
            .setHasProjectRequests(project.hasProjectRequests());
    }

    public static AdminProject full(Project project, List<CompanyProjectRequest> pros){
        return from(project)
            .setDetails(project.getDetails())
            .setProjectRequests(pros)
            .setProjectActions(project.getProjectActions());
    }
}
