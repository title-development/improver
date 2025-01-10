package com.improver.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import lombok.Data;
import lombok.ToString;
import lombok.experimental.Accessors;
import org.springframework.util.CollectionUtils;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.util.*;

@Data
@Accessors(chain = true)
@Entity(name = "questions")
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @ToString.Exclude
    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "questionary_id", foreignKey = @ForeignKey(name = "question_questionary_fkey"))
    private Questionary questionary;

    private String name;

    private String label = "";

    @NotNull
    private String title;

    @Enumerated(EnumType.STRING)
    private Type type;

    @JsonManagedReference
    @OneToMany(mappedBy = "question", fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    @OrderColumn(name = "order_index")
    private List<Answer> answers;


    public boolean isMultipleAnswers() {
        return Type.CHECK_BOX.equals(type) || Type.IMG_CHECK_BOX.equals(type);
    }

    public boolean isInputAnswer() {
        return Type.TEXT_INPUT.equals(type) || Type.TEXT_AREA.equals(type) || Type.NUMERIC_INPUT.equals(type);
    }


    public Question add(Answer answer) {
        if (CollectionUtils.isEmpty(getAnswers())) {
            answers = new LinkedList<>();
        }
        answers.add(answer.setQuestion(this));
        return this;
    }


    public Question addAnswer(String label) {
        return add(new Answer().setLabel(label));
    }

    public Question addAnswer(String label, String image) {
        return add(new Answer().setLabel(label).setImage(image));
    }


    /**
     * Question type enum
     */
    public enum Type {
        TEXT_INPUT("TEXT_INPUT"),
        TEXT_AREA("TEXT_AREA"),
        NUMERIC_INPUT("NUMERIC_INPUT"),
        CHECK_BOX("CHECK_BOX"),
        RADIO_BUTTON("RADIO_BUTTON"),
        IMG_CHECK_BOX("IMG_CHECK_BOX"),
        IMG_RADIO_BUTTON("IMG_RADIO_BUTTON");


        private final String value;

        Type(String type) {
            value = type;
        }

        public boolean equalsValue(String type) {
            return value.equals(type);
        }

        @Override
        public String toString() {
            return this.value;
        }
    }


}
