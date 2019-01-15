package com.improver.model.in;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.experimental.Accessors;

import java.util.List;

@Data
@Accessors(chain = true)
public class Order {

    private long serviceId;

    @JsonProperty("questionaryGroup")
    private List<QuestionAnswer> questionary;


    @JsonProperty("defaultQuestionaryGroup")
    private OrderDetails details;
}
