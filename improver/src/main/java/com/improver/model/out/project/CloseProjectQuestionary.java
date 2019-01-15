package com.improver.model.out.project;


import com.improver.entity.Project;
import com.improver.model.out.NameIdImageTuple;
import lombok.Getter;

import java.util.*;

import static com.improver.entity.Project.cancelList;
import static com.improver.entity.Project.completeList;

@Getter
public class CloseProjectQuestionary {

    private final List<NameIdImageTuple> projectRequests;
    private final Map<Project.Reason, String> completeVariants;
    private final Map<Project.Reason, String> cancelVariants;


    public CloseProjectQuestionary(List<NameIdImageTuple> projectRequests) {
        this.projectRequests = projectRequests;
        this.cancelVariants = cancelList;
        this.completeVariants = completeList;

    }
}
