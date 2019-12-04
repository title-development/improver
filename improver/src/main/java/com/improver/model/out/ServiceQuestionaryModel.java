package com.improver.model.out;

import com.improver.entity.Question;
import lombok.Data;

import java.util.List;

@Data
public class ServiceQuestionaryModel {

    private final List<Question> questions;
    private final boolean hasPhone;

    public ServiceQuestionaryModel(List<Question> questions, boolean hasPhone) {
        this.questions = questions;
        this.hasPhone = hasPhone;
    }
}
