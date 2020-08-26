import { Component, Input, OnInit } from '@angular/core';
import { QuestionaryBlock, QuestionType } from "../../../../../model/questionary-model";
import { QuestionaryControlService } from "../../../../../api/services/questionary-control.service";
import { Constants } from "../../../../../util/constants";
import { TextMessages } from "../../../../../util/text-messages";
import { MatDialog } from "@angular/material/dialog";

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
              public messages: TextMessages,) {
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

  close() {
    this.dialog.closeAll();
  };


}
