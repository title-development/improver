package com.improver.model.out.project;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonRawValue;
import com.improver.entity.Location;
import com.improver.entity.Project;
import lombok.Getter;
import java.time.ZonedDateTime;
import java.util.Collection;
import java.util.List;

import static com.improver.util.serializer.SerializationUtil.DATE_TIME_PATTERN;

@Getter
public class CustomerProject{

    private final long id;
    private final String serviceType;
    private final Location location;
    private final String startDate;
    private final String notes;
    @JsonRawValue
    private final String details;
    @JsonFormat(pattern = DATE_TIME_PATTERN)
    private final ZonedDateTime created;
    private final Project.Status status;
    private List<CompanyProjectRequest> projectRequests;
    private Collection<String> images;



    private CustomerProject(Project project) {
        this.id = project.getId();
        this.serviceType = project.getServiceType().getName();
        this.location = project.getLocation();
        this.startDate = project.getStartDate();
        this.notes = project.getNotes();
        this.details = project.getDetails();
        this.created = project.getCreated();
        this.status = project.getStatus();
    }

    public CustomerProject(Project project, List<CompanyProjectRequest> projectRequests, Collection<String> imageUrls) {
        this(project);
        this.projectRequests = projectRequests;
        this.images = imageUrls;
    }
}
