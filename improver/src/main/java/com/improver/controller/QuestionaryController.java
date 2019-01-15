package com.improver.controller;

import com.improver.entity.Question;
import com.improver.model.admin.AdminQuestionary;
import com.improver.repository.QuestionRepository;
import com.improver.repository.QuestionaryRepository;
import com.improver.repository.ServiceTypeRepository;
import com.improver.security.annotation.SupportAccess;
import com.improver.service.QuestionaryService;
import com.improver.security.annotation.AdminAccess;
import com.improver.util.annotation.PageableSwagger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import static com.improver.application.properties.Path.ID_PATH_VARIABLE;
import static com.improver.application.properties.Path.QUESTIONARY_PATH;

@RestController
@RequestMapping(QUESTIONARY_PATH)
public class QuestionaryController {

    @Autowired QuestionaryRepository questionaryRepository;
    @Autowired QuestionaryService questionaryService;
    @Autowired ServiceTypeRepository serviceTypeRepository;
    @Autowired QuestionRepository questionRepository;

    @SupportAccess
    @PageableSwagger
    @GetMapping
    public ResponseEntity<Page<AdminQuestionary>> getAll(
        @RequestParam(required = false) Long id,
        @RequestParam(required = false) String name,
        @PageableDefault(sort = "id", direction = Sort.Direction.ASC) Pageable pageRequest) {
        Page<AdminQuestionary> questionaries = questionaryService.getQuestionary(id, name, pageRequest);
        return new ResponseEntity<>(questionaries, HttpStatus.OK);
    }

    @SupportAccess
    @GetMapping(ID_PATH_VARIABLE)
    public ResponseEntity<AdminQuestionary> getQuestionaryById(@PathVariable long id) {
        AdminQuestionary questionary = questionaryService.getQuestionaryById(id);

        return new ResponseEntity<>(questionary, HttpStatus.OK);
    }

    @AdminAccess
    @DeleteMapping(ID_PATH_VARIABLE)
    public ResponseEntity<Void> deleteQuestionaryById(@PathVariable long id) {
        questionaryService.deleteQuestionaryById(id);

        return new ResponseEntity<>(HttpStatus.OK);
    }

    @AdminAccess
    @PutMapping(ID_PATH_VARIABLE)
    public ResponseEntity<Void> updateQuestionary(@PathVariable long id, @RequestBody AdminQuestionary questionary) {
        questionaryService.updateQuestionary(id, questionary);

        return new ResponseEntity<>(HttpStatus.OK);
    }

    @AdminAccess
    @PostMapping
    public ResponseEntity<Void> addQuestionary(@RequestBody AdminQuestionary questionary) {
        questionaryService.addQuestionary(questionary);

        return new ResponseEntity<>(HttpStatus.OK);
    }

    @AdminAccess
    @PostMapping(ID_PATH_VARIABLE + "/questions")
    public ResponseEntity<Void> addQuestion(@PathVariable long id, @RequestBody Question question) {
        questionaryService.addQuestionToQuestionary(id, question);

        return new ResponseEntity<>(HttpStatus.OK);
    }

    @AdminAccess
    @PutMapping("/questions" + ID_PATH_VARIABLE)
    public ResponseEntity<Void> updateQuestion(@PathVariable long id, @RequestBody Question question) {
        questionaryService.updateQuestion(id, question);

        return new ResponseEntity<>(HttpStatus.OK);
    }

    @AdminAccess
    @DeleteMapping("/questions" + ID_PATH_VARIABLE)
    public ResponseEntity<Void> deleteQuestion(@PathVariable long id) {
        questionaryService.removeQuestion(id);

        return new ResponseEntity<>(HttpStatus.OK);
    }

    @AdminAccess
    @DeleteMapping("/answer-image" + ID_PATH_VARIABLE)
    public ResponseEntity<Void> deleteAnswerImage(@PathVariable long id) {
        questionaryService.deleteAnswerImage(id);

        return new ResponseEntity<>(HttpStatus.OK);
    }
}
