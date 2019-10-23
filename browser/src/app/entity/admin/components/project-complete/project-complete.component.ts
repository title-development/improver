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
  selector: 'project-complete',
  templateUrl: './project-complete.component.html',
  styleUrls: ['./project-complete.component.scss']
})
export class ProjectCompleteComponent implements OnInit {

  @Input() project: Project;
  @Output() toggleChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() onDone: EventEmitter<Location> = new EventEmitter<Location>();

  @ViewChild('form') form: NgForm;
  completeVariants = [];
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
        this.completeVariants = [];

        for (let projectRequest of closeVariants.projectRequests) {
          this.completeVariants.push(
            {
              label: 'Done by: "' + projectRequest.name + '"',
              value: projectRequest.id
            }
          )
        }

        for (let key in closeVariants.completeVariants) {
          if (key == 'DONE') continue;
          this.completeVariants.push(
            {
              label: closeVariants.completeVariants[key],
              value: key
            }
          )
        }

      },
      err => this.popUpMessageService.showError(getErrorMessage(err))
    )
  }

  completeProject() {
    console.log(!isNaN(this.reason));
    this.processing = true;
    let closeProjectRequest: CloseProjectRequest = {
      action: 'COMPLETE',
      reason: this.reason
    };
    // checks that reason is number (id of project request)
    if (!isNaN(this.reason)) {
      closeProjectRequest.reason = "DONE";
      closeProjectRequest.projectRequestId = this.reason;
    }
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
