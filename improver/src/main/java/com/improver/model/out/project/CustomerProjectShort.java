package com.improver.model.out.project;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.improver.entity.Project;
import lombok.Getter;

import java.time.ZonedDateTime;
import java.util.List;

import static com.improver.util.serializer.SerializationUtil.DATE_TIME_PATTERN;

@Getter
public class CustomerProjectShort {

    private final long id;
    private final String serviceType;
    private final Project.Status status;
    @JsonFormat(pattern = DATE_TIME_PATTERN)
    private final ZonedDateTime created;
    private final String coverUrl;
    private List<CompanyProjectRequest> projectRequests;


    public CustomerProjectShort(long id, String serviceType, Project.Status status, ZonedDateTime created, String coverUrl) {
        this.id = id;
        this.serviceType = serviceType;
        this.created = created;
        this.status = status;
        this.coverUrl = coverUrl;
    }


    public void setProjectRequests(List<CompanyProjectRequest> projectRequests) {
        this.projectRequests = projectRequests;
    }
}
