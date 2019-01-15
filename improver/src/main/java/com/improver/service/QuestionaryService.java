package com.improver.service;

import com.improver.entity.*;
import com.improver.exception.ConflictException;
import com.improver.exception.NotFoundException;
import com.improver.model.NameIdParentTuple;
import com.improver.model.NameIdTuple;
import com.improver.model.admin.AdminQuestionary;
import com.improver.repository.AnswerRepository;
import com.improver.repository.QuestionRepository;
import com.improver.repository.QuestionaryRepository;
import com.improver.repository.ServiceTypeRepository;
import org.apache.commons.codec.binary.Base64;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class QuestionaryService {
    @Autowired QuestionaryRepository questionaryRepository;
    @Autowired ServiceTypeRepository serviceTypeRepository;
    @Autowired QuestionRepository questionRepository;
    @Autowired AnswerRepository answerRepository;
    @Autowired ImageService imageService;

    public Page<AdminQuestionary> getQuestionary(Long id, String name, Pageable pageRequest) {
        Page<AdminQuestionary> existed = questionaryRepository.getAll(id, name, pageRequest);
        List<NameIdParentTuple> serviceTypes = serviceTypeRepository.getAllWithQuestionary();
        MultiValueMap<Long, NameIdParentTuple> services = new LinkedMultiValueMap<>();
        serviceTypes.forEach(tuple -> services.add(tuple.getParentId(), tuple));
        existed.getContent().forEach(questionary -> questionary.addServiceTypes(services.get(questionary.getId())));
        return existed;
    }

    public AdminQuestionary getQuestionaryById(long id) {
        Questionary questionary = questionaryRepository.findById(id)
            .orElseThrow(NotFoundException::new);
        List<NameIdTuple> serviceTypes = serviceTypeRepository.getAllServiceTypesByQuestionaryId(id);

        return new AdminQuestionary(questionary, serviceTypes);
    }

    public void deleteQuestionaryById(long id) {
        Questionary questionary = questionaryRepository.findById(id)
            .orElseThrow(NotFoundException::new);
        questionary.deleteQuestions();
        questionary.deleteServiceTypes();
        questionaryRepository.deleteById(id);
    }

    public void updateQuestionary(long id, AdminQuestionary questionary) throws ConflictException {
        Questionary existed = questionaryRepository.findById(id)
            .orElseThrow(NotFoundException::new);
        if (!questionaryRepository.isQuestionaryNameFree(questionary.getName())
            && !existed.getName().equalsIgnoreCase(questionary.getName())) {
            throw new ConflictException("Questionary with name " + questionary.getName() + " already exist.");
        }
        if (questionary.getServiceTypes().isEmpty()) {
            throw new ConflictException("Please select at least one service type.");
        }
        List<Long> serviceIds = questionary.getServiceTypes().stream()
            .map(NameIdTuple::getId)
            .collect(Collectors.toList());
        List<ServiceType> serviceTypes = serviceTypeRepository.findByIdIn(serviceIds);
        existed.setName(questionary.getName());
        existed.setDescription(questionary.getDescription());
        existed.updateServiceTypes(serviceTypes);
        existed.updateQuestions(questionary.getQuestions());
        questionaryRepository.save(existed);
    }

    public void addQuestionary(AdminQuestionary questionary) throws ConflictException {
        if (!questionaryRepository.isQuestionaryNameFree(questionary.getName())) {
            throw new ConflictException("Questionary with name " + questionary.getName() + " already exist.");
        }
        if (questionary.getServiceTypes().isEmpty()) {
            throw new ConflictException("Please select at least one service type.");
        }
        if (questionaryRepository.existsByServiceTypesIdIn(questionary.getServiceTypes().stream().map(q -> q.getId()).toArray(Long[]::new))) {
            throw new ConflictException("Some of Service Types already have a questionary");
        }
        List<Question> questions = questionary.getQuestions();
        questions.forEach(question -> {
            if (question.getType().equals(Question.Type.IMG_CHECK_BOX) || question.getType().equals(Question.Type.IMG_RADIO_BUTTON)) {
                List<Answer> answers = question.getAnswers();
                answers.forEach(answer -> {
                    String imageToUpdate = answer.getImage();
                    String imageUrl = imageService.updateBase64Image(imageToUpdate, null);
                    answer.setImage(imageUrl);
                });
            }
        });
        Questionary saved = questionaryRepository.save(new Questionary());
        List<Long> serviceTypeIds = questionary.getServiceTypes().stream().map(NameIdTuple::getId).collect(Collectors.toList());
        List<ServiceType> serviceTypes = serviceTypeRepository.findByIdIn(serviceTypeIds);
        saved.setName(questionary.getName())
            .setDescription(questionary.getDescription())
            .addServices(serviceTypes)
            .addQuestions(questionary.getQuestions());
        questionaryRepository.save(saved);

    }

    public void addQuestionToQuestionary(long id, Question question) {
        Questionary questionary = questionaryRepository.findById(id)
            .orElseThrow(NotFoundException::new);
        if (question.getType().equals(Question.Type.IMG_CHECK_BOX) || question.getType().equals(Question.Type.IMG_RADIO_BUTTON)) {
            List<Answer> answers = question.getAnswers();
            answers.forEach(answer -> {
                String imageToUpdate = answer.getImage();
                if(imageService.isBase64Image(imageToUpdate)) {
                    String imageUrl = imageService.updateBase64Image(imageToUpdate, null);
                    answer.setImage(imageUrl);
                }
            });
        }
        questionary.addQuestion(question);
        questionRepository.save(question);
        questionaryRepository.save(questionary);
    }

    public void removeQuestion(long questionId) {
        Question question = questionRepository.findById(questionId)
            .orElseThrow(NotFoundException::new);

        Questionary existed = Optional.ofNullable(question.getQuestionary())
            .orElseThrow(() -> new ConflictException("Questionary not existed for question=" + question.getTitle()));

        List<Question> questions = existed.getQuestions();
        questions.remove(question);

        questionRepository.deleteById(questionId);
        questionaryRepository.save(existed);
    }

    public void updateQuestion(long id, Question question) {
        Question existedQuestion = questionRepository.findById(id)
            .orElseThrow(NotFoundException::new);
        removeDeletedAnswers(existedQuestion, question.getAnswers());

        if (question.getType().equals(Question.Type.IMG_CHECK_BOX) || question.getType().equals(Question.Type.IMG_RADIO_BUTTON)) {
            question.getAnswers().forEach(answer -> {
                String imageToUpdate = answer.getImage();
                if (imageService.isBase64Image(imageToUpdate)) {
                    String imageUrl;
                    Optional<Answer> oldAnswer = existedQuestion.getAnswers().stream()
                        .filter(existedAnswer -> existedAnswer.getId() == answer.getId())
                        .findFirst();
                    if(oldAnswer.isPresent()) {
                        imageUrl = imageService.updateBase64Image(imageToUpdate, oldAnswer.get().getImage());
                    } else {
                        imageUrl = imageService.updateBase64Image(imageToUpdate, null);
                    }
                    answer.setImage(imageUrl);
                }
            });
        }

        question.setQuestionary(existedQuestion.getQuestionary());
        questionRepository.save(question);
    }

    public void deleteAnswerImage(long id) {
        Answer answer = answerRepository.findById(id)
            .orElseThrow(NotFoundException::new);
        String imageUrl = answer.getImage();
        imageService.silentDelete(imageUrl);
        answerRepository.save(answer.setImage(null));
    }

    private void removeDeletedAnswers(Question question, List<Answer> newAnswers) {
        List<Answer> toDelete = question.getAnswers().stream()
            .filter(existed -> {
                if (newAnswers.stream().noneMatch(answers -> answers.getId() == existed.getId())) {
                    String imageUrl = existed.getImage();
                    if (imageUrl != null && !imageUrl.isEmpty()) {
                        imageService.silentDelete(imageUrl);
                    }
                    return true;
                } else {
                    return false;
                }
            })
            .collect(Collectors.toList());
        answerRepository.deleteAll(toDelete);
    }

}
