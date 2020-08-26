import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { LocationValidateService } from '../../../../api/services/location-validate.service';
import { ValidatedLocation } from '../../../../api/models/LocationsValidation';
import { Location } from '../../../../model/data-model';
import { SelectItem } from 'primeng';
import { Constants } from '../../../../util/constants';
import { NgForm } from '@angular/forms';
import { Project } from "../../../../api/models/Project";
import { enumToArrayList } from "../../../../api/services/tricks.service";
import { getErrorMessage } from "../../../../util/functions";
import { ProjectService } from "../../../../api/services/project.service";
import { PopUpMessageService } from "../../../../api/services/pop-up-message.service";

@Component({
  selector: 'project-comment',
  templateUrl: './project-comment.component.html',
  styleUrls: ['./project-comment.component.scss']
})
export class ProjectCommentComponent {

  @Input() project: Project;
  @Output() toggleChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() onDone: EventEmitter<Location> = new EventEmitter<Location>();

  @ViewChild('form') form: NgForm;

  model = {
    comment: ''
  };

  processing: boolean = false;

  private _toggle: boolean = false;

  @Input()
  get toggle(): boolean {
    return this._toggle;
  }

  set toggle(value: boolean) {
    this.toggleChange.emit(value);
    this._toggle = value;
  }

  constructor(public projectService: ProjectService,
              public popUpMessageService: PopUpMessageService,
              public constants: Constants) {
  }

  addComment(): void {
    this.processing = true;
    this.projectService.addComment(this.project.id, this.model.comment).subscribe(
      res => {
        this.onDone.emit();
        this.processing = false;
        this.model.comment = '';
        this.form.resetForm();
        this.popUpMessageService.showSuccess('Project comment added');
        this.toggle = !this.toggle;
      },
      err => {
        this.processing = false;
        this.popUpMessageService.showError(getErrorMessage(err));
      });
  }

}
