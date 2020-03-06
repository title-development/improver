import { Component, Input, OnInit } from '@angular/core';
import { QuestionaryControlService }    from '../../../../util/questionary-control.service';
import { MatDialog, MatDialogRef } from "@angular/material/dialog";

@Component({
  selector: 'questionary-form',
  templateUrl: './questionary-form.component.html',
  styleUrls: ['./questionary-form.component.scss']
})

export class QuestionaryFormComponent implements OnInit {

  constructor(public questionaryControlService: QuestionaryControlService,
              public currentDialogRef: MatDialogRef<any>,
              public dialog : MatDialog ) {
  }

  ngOnInit() {
  }

}

