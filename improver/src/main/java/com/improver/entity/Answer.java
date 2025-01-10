package com.improver.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.experimental.Accessors;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;


@Data
@Accessors(chain = true)
@NoArgsConstructor
@Entity(name = "answers")
public class Answer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @ToString.Exclude
    @JsonBackReference
    @ManyToOne
    @JoinColumn(name = "question_id", foreignKey = @ForeignKey(name = "answer_question_fkey"))
    private Question question;

    private String name;

    private String image;

    @NotNull
    @Column(nullable = false)
    private String label;

}
