import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { LocationValidateService } from '../../../../api/services/location-validate.service';
import { ValidatedLocation } from '../../../../api/models/LocationsValidation';
import { Location } from '../../../../model/data-model';
import { SelectItem } from 'primeng';
import { Constants } from '../../../../util/constants';
import { NgForm } from '@angular/forms';
import { Project } from "../../../../api/models/Project";
import { enumToArrayList } from "../../../../util/tricks.service";
import { getErrorMessage } from "../../../../util/functions";
import { ProjectService } from "../../../../api/services/project.service";
import { PopUpMessageService } from "../../../../util/pop-up-message.service";

@Component({
  selector: 'project-validation-request',
  templateUrl: './project-validation-request.component.html',
  styleUrls: ['./project-validation-request.component.scss']
})
export class ProjectValidationRequestComponent {

  @Input() project: Project;
  @Input() validation: Project.ValidationRequest;
  @Output() toggleChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() onDone: EventEmitter<Location> = new EventEmitter<Location>();

  @ViewChild('form') form: NgForm;

  Project = Project;
  projectReasons: Array<SelectItem> = [];

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
    this.projectReasons = enumToArrayList(Project.SystemReason).map(item => {
      return {label: item, value: item};
    });
  }

  requestValidation(form): void {
    this.processing = true;
    this.projectService.validation(this.project.id, this.validation).subscribe(
      res => {
        this.onDone.emit();
        this.processing = false;
        this.popUpMessageService.showSuccess('Project validation state updated');
        this.toggle = !this.toggle;
        setTimeout(() => {
          form.resetForm();
          form.reset();
          Object.values(this.form.controls).forEach(control => control.markAsPristine());
        }, 200)
      },
      err => {
        this.processing = false;
        this.popUpMessageService.showError(getErrorMessage(err));
      });
  }

}
