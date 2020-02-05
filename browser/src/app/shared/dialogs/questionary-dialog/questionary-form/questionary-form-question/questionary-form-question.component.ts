import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { QuestionaryBlock, QuestionType } from "../../../../../model/questionary-model";
import { QuestionaryControlService } from "../../../../../util/questionary-control.service";
import { Constants } from "../../../../../util/constants";
import { Messages } from "../../../../../util/messages";
import { MatDialog } from "@angular/material";

@Component({
  selector: 'questionary-form-question',
  templateUrl: './questionary-form-question.component.html',
  styleUrls: ['./questionary-form-question.component.scss'],
})

export class QuestionaryFormQuestionComponent implements OnInit{
  @Input() question: QuestionaryBlock;
  @Input() index: number;
  public QuestionType = QuestionType;
  public questionaryForm;

  constructor(public questionaryControlService: QuestionaryControlService,
              public dialog: MatDialog,
              public constants: Constants,
              public messages: Messages,) {
    this.constants = constants;
    this.messages = messages;
  }

  ngOnInit(): void {
    this.questionaryForm = this.questionaryControlService.mainForm.get('questionaryGroup');
  }

  get isValid() {
    return this.questionaryForm.controls[this.question.name].valid;
  }

  nextQuestion() {
    if (this.isValid) {
       this.questionaryControlService.currentQuestionIndex++;
    } else {
      this.questionaryForm.controls[this.question.name].markAsTouched({onlySelf: false});
    }

  }

  previousQuestion() {
    this.questionaryControlService.currentQuestionIndex > -1 ? this.questionaryControlService.currentQuestionIndex-- : "";
  }

  close() {
    this.dialog.closeAll();
  };


}
