package com.improver.entity;



import lombok.Data;
import lombok.experimental.Accessors;
import org.springframework.util.CollectionUtils;

import javax.persistence.*;
import java.util.LinkedList;
import java.util.List;
import java.util.regex.Pattern;

@Entity(name = "questionaries")
@Data
@Accessors(chain = true)
public class Questionary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private String name;

    private String description;

    @OneToMany(mappedBy = "questionary", cascade = {CascadeType.PERSIST, CascadeType.REFRESH, CascadeType.MERGE} )
    private List<ServiceType> serviceTypes;

    @OneToMany(mappedBy = "questionary", cascade = CascadeType.ALL)
    @OrderColumn(name="order_index")
    private List<Question> questions = new LinkedList<>();



    public Question getQuestionByName(String questionName) {
        return getQuestions().stream()
            .filter(question -> question.getName().equals(questionName))
            .findAny()
            .orElse(null);
    }

    public Questionary addServices(List<ServiceType> serviceTypes) {
        serviceTypes.forEach(this::addService);
        return this;
    }

    public Questionary addService(ServiceType serviceType){
        if(CollectionUtils.isEmpty(getServiceTypes())){
            serviceTypes = new LinkedList<>();
        }
        serviceTypes.add(serviceType.setQuestionary(this));
        return this;
    }

    public Questionary updateServiceTypes(List<ServiceType> toUpdate) {
        this.getServiceTypes().forEach(serviceType ->  serviceType.setQuestionary(null));
        this.serviceTypes = toUpdate;
        toUpdate.forEach(serviceType ->  serviceType.setQuestionary(this));
        return this;
    }

    public Questionary deleteServiceTypes() {
        this.getServiceTypes().forEach(serviceType ->  serviceType.setQuestionary(null));

        return  this;
    }

    public Questionary updateQuestions(List<Question> toUpdate) {
        toUpdate.forEach(question -> question.setQuestionary(this));
        this.questions.clear();
        this.questions.addAll(toUpdate);
        return this;
    }

    public Questionary deleteQuestions() {
        this.getQuestions().forEach(question -> question.setQuestionary(null));

        return this;
    }

    public Questionary addQuestions(List<Question> questions) {
        questions.forEach(this::addQuestion);

        return this;
    }

    public Questionary addQuestion(Question question){
        questions.add(question.setQuestionary(this));
        return this;
    }

    /**
     * Should be Called after save
     *
     */
    @Deprecated
    public Questionary reprocessNames() {
        getQuestions().forEach(question -> {
            defineName(question);
            if (question.getAnswers() != null) {
                question.getAnswers().forEach(this::defineName);
            }
        });
        return this;
    }


    private Answer defineName(Answer answer) {
        if (answer.getName() == null) {
            answer.setName(convert(answer.getId(), answer.getLabel()));
        }
        return answer;
    }

    private Question defineName(Question question) {
        if (question.getName() == null) {
            question.setName(convert(question.getId(), question.getTitle()));
        }
        return question;
    }

    private String convert(long id, String text) {
        return id + "_" + SPECIAL_CHARS.matcher(text.toLowerCase()).replaceAll("").replaceAll(" ", "_");
    }

    private static final Pattern SPECIAL_CHARS = Pattern.compile("[/|\\\\+?!@#$%^&().,;:'\"]");
}
