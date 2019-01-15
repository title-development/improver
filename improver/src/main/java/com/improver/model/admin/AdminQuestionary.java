package com.improver.model.admin;

import com.improver.entity.Question;
import com.improver.entity.Questionary;
import com.improver.model.NameIdParentTuple;
import com.improver.model.NameIdTuple;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;


import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Accessors(chain = true)
public class AdminQuestionary {
    private long id;
    private String name;
    private String description;
    private List<NameIdTuple> serviceTypes = new ArrayList<>();
    private List<Question> questions;

    public AdminQuestionary(long id, String name, String description) {
        this.id = id;
        this.name = name;
        this.description = description;
    }

    public AdminQuestionary(Questionary questionary, List<NameIdTuple> serviceTypes) {
        this.id = questionary.getId();
        this.name = questionary.getName();
        this.description = questionary.getDescription();
        this.questions = questionary.getQuestions();
        this.serviceTypes = serviceTypes;
    }

    public AdminQuestionary addServiceTypes(List<NameIdParentTuple> serviceTypes) {
        if (serviceTypes == null) {
            return this;
        }
        serviceTypes.forEach(this::addServiceType);
        return this;
    }

    public AdminQuestionary addServiceType(NameIdParentTuple service) {
        serviceTypes.add(new NameIdTuple(service.getId(), service.getName()));
        return this;
    }

    public AdminQuestionary addServiceType(NameIdTuple service) {
        this.serviceTypes.add(service);
        return this;
    }


}
