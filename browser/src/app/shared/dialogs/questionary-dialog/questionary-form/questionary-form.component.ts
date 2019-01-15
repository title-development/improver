import { Component, Input, OnInit } from '@angular/core';
import { FormGroup }                 from '@angular/forms';
import { QuestionaryControlService }    from '../../../../util/questionary-control.service';
import { QuestionaryBlock }          from "../../../../model/questionary-model";
import { ServiceType } from "../../../../model/data-model";
import { MatDialog, MatDialogRef } from "@angular/material";

@Component({
  selector: 'questionary-form',
  templateUrl: './questionary-form.component.html',
  styleUrls: ['./questionary-form.component.scss']
})

export class QuestionaryFormComponent implements OnInit {
  @Input() questionary: QuestionaryBlock[]; //TODO: shorten to 'survey'?
  @Input() serviceType: ServiceType;
  @Input() companyId: string;

  mainForm: FormGroup;
  changeBg = false;

  constructor(public questionaryControlService: QuestionaryControlService,
              public currentDialogRef: MatDialogRef<any>,
              public dialog : MatDialog ) {
  }

  ngOnInit() {
    this.mainForm = this.questionaryControlService.toFormGroup(this.questionary);
  }

}

