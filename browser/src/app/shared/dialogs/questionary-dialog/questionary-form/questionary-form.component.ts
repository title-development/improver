import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { QuestionaryControlService } from '../../../../api/services/questionary-control.service';
import { MatDialog, MatDialogRef } from "@angular/material/dialog";

@Component({
  selector: 'questionary-form',
  templateUrl: './questionary-form.component.html',
  styleUrls: ['./questionary-form.component.scss']
})

export class QuestionaryFormComponent implements OnInit, AfterViewInit {

  @ViewChild('mainForm', {static: true}) mainForm;

  constructor(public questionaryControlService: QuestionaryControlService,
              public currentDialogRef: MatDialogRef<any>,
              public dialog : MatDialog ) {

  }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    this.mainForm.valueChanges.subscribe(value => {
      this.questionaryControlService.hasUnsavedChanges = true
    })
  }

}

