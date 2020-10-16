import { Component, EventEmitter, OnInit } from '@angular/core';
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {SecurityService} from "../../../auth/security.service";
import {CompanyProjectRequest} from "../../../model/data-model";
import {ProjectRequest} from "../../../api/models/ProjectRequest";
import {ProjectRequestService} from "../../../api/services/project-request.service";

@Component({
  selector: 'not-reviewed-project-request-dialog',
  templateUrl: './not-reviewed-project-request-dialog.component.html',
  styleUrls: ['./not-reviewed-project-request-dialog.component.scss']
})
export class NotReviewedProjectRequestDialogComponent implements OnInit {

  projectRequests: Array<CompanyProjectRequest>;
  step: number = 1;
  selectedProjectRequest: ProjectRequest;
  companyId: string;
  title: string = 'Leave Review';
  projectsProcessing: boolean = false;
  onSuccess: EventEmitter<any> = new EventEmitter<any>();

  constructor(private projectRequestService: ProjectRequestService,
              public currentDialogRef: MatDialogRef<any>,
              public dialog: MatDialog,
              public securityService: SecurityService) {
  }

  ngOnInit(): void {
  }

  close() {
    this.currentDialogRef.close();
  }

  nextStep(customerProjectShort: any) {
    this.title = customerProjectShort.serviceType;
    this.selectedProjectRequest = this.of(customerProjectShort);
    this.step = 2;
  }

  previousStep() {
    this.step = 1;
    this.title = 'Leave Review';
  }

  private of(model: CompanyProjectRequest): ProjectRequest {
    let projectRequest = new ProjectRequest();
    projectRequest.id = model.id.toString();
    projectRequest.status = model.status;
    projectRequest.reviewed = model.isReviewed;
    projectRequest.company = model.company;
    return projectRequest;
  }

}
