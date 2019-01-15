package com.improver.model.in;

import lombok.Data;
import lombok.experimental.Accessors;

import java.util.List;

@Data
@Accessors(chain = true)
public class QuestionAnswer {

    private String name;
    private List<String> results;

    public QuestionAnswer() {
    }

    public QuestionAnswer(String name, List<String> results) {
        this.name = name;
        this.results = results;
    }
}
