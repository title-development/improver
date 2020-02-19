import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { CloseProjectRequest, Location } from '../../../../model/data-model';
import { Constants } from '../../../../util/constants';
import { NgForm } from '@angular/forms';
import { Project } from "../../../../api/models/Project";
import { getErrorMessage } from "../../../../util/functions";
import { ProjectService } from "../../../../api/services/project.service";
import { PopUpMessageService } from "../../../../util/pop-up-message.service";
import { finalize } from "rxjs/operators";

@Component({
  selector: 'project-cancel',
  templateUrl: './project-cancel.component.html',
  styleUrls: ['./project-cancel.component.scss']
})
export class ProjectCancelComponent implements OnInit {

  @Input() project: Project;
  @Output() toggleChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() onDone: EventEmitter<Location> = new EventEmitter<Location>();

  @ViewChild('form', {static: true}) form: NgForm;
  cancelVariants = [];
  comment;
  reason;

  processing: boolean = false;

  private _toggle: boolean = false;

  @Input()
  get toggle(): boolean {
    return this._toggle;
  }

  set toggle(value: boolean) {
    this.toggleChange.emit(value);
    this._toggle = value;
    if (this._toggle) {
      this.getCloseVariants();
    } else {
      this.form.resetForm();
    }
  }

  constructor(public projectService: ProjectService,
              public popUpMessageService: PopUpMessageService,
              public constants: Constants) {
  }

  ngOnInit(): void {

  }

  getCloseVariants() {
    this.projectService.getCloseProjectVariantsBySupport(this.project.id).subscribe(
      closeVariants => {
        this.cancelVariants = [];
        for (let key in closeVariants.cancelVariants) {
          this.cancelVariants.push(
            {
              label: closeVariants.cancelVariants[key],
              value: key
            }
          )
        }

      },
      err => this.popUpMessageService.showError(getErrorMessage(err))
    )
  }

  cancelProject() {
    this.processing = true;
    let closeProjectRequest: CloseProjectRequest = {
      action: 'CANCEL',
      comment: this.comment,
      reason: this.reason
    };
    this.projectService.closeProjectBySupport(this.project.id, closeProjectRequest)
      .pipe(finalize(() => this.processing = false))
      .subscribe(
      () => {
        this.toggle = false;
        this.onDone.emit();
      },
      err => this.popUpMessageService.showError(getErrorMessage(err))
    )
  }


}
