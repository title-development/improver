package com.improver.model.out.project;

import com.fasterxml.jackson.annotation.JsonRawValue;
import com.improver.entity.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.Accessors;

import java.util.Collection;


@Getter
@EqualsAndHashCode(callSuper = true)
public class ProjectRequestDetailed extends ProjectRequestShort {

    private Location location;
    private String startDate;
    private String notes;

    @JsonRawValue
    private String details;

    @Setter @Accessors(chain = true)
    private Collection<String> images;


    public ProjectRequestDetailed(Project project, String serviceName, Customer customer, ProjectRequest projectRequest, Long refundId, Long reviewId) {

        super(project, serviceName, customer, projectRequest, refundId, reviewId);
        this.customer.setId(customer.getId());
        this.customer.setPhone(customer.getInternalPhone());
        this.location = project.getLocation();
        this.startDate = project.getStartDate();
        this.notes = project.getNotes();
        this.details = project.getDetails();
    }



}
