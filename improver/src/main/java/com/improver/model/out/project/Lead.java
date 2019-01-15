package com.improver.model.out.project;

import com.fasterxml.jackson.annotation.JsonRawValue;
import com.improver.entity.Project;
import lombok.EqualsAndHashCode;
import lombok.Getter;


@Getter
@EqualsAndHashCode(callSuper = true)
public class Lead extends ShortLead {

    private final String clientName;
    private final String startDate;
    private final String notes;
    @JsonRawValue
    private final String details;

    public Lead(Project project) {
        super(project);
        this.clientName = project.getCustomer().getDisplayName();
        this.startDate = project.getStartDate();
        this.notes = project.getNotes();
        this.details = project.getDetails();
    }
}
