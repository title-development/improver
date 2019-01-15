import {
  EventEmitter,
  Injectable
} from '@angular/core';
import {
  completeProjectDialogConfig, confirmDialogConfig, customerProjectRequestDialogConfig,
  questionaryDialogConfig
} from '../shared/dialogs/dialogs.configs';
import {
  CloseProjectRequest, ContractorProjectShort, CustomerProject, ServiceType, SystemMessageType
} from '../model/data-model';
import { MatDialog, MatDialogRef } from '@angular/material';
import { ProjectService } from '../api/services/project.service';
import { PopUpMessageService } from './pop-up-message.service';
import { ProjectRequestService } from '../api/services/project-request.service';
import { QuestionaryControlService } from './questionary-control.service';
import { SecurityService } from '../auth/security.service';
import { dialogsMap } from '../shared/dialogs/dialogs.state';
import { QuestionaryBlock } from '../model/questionary-model';
import { ServiceTypeService } from "../api/services/service-type.service";
import { getErrorMessage } from "./functions";
import { ProjectRequest } from '../api/models/ProjectRequest';
import { BoundariesService } from "../api/services/boundaries.service";
import { Role } from "../model/security-model";

@Injectable()
export class ProjectActionService {

  projectRequestDialogRef: MatDialogRef<any>;
  projectId = '';
  project: CustomerProject;
  confirmDialogRef: MatDialogRef<any>;
  onProjectsUpdate: EventEmitter<any> = new EventEmitter<any>();
  private questionaryDialogRef: MatDialogRef<any>;
  zipIsChecking = false;
  zipIsSupported = true;

  constructor(public dialog: MatDialog,
              public securityService: SecurityService,
              public projectService: ProjectService,
              public serviceTypeService: ServiceTypeService,
              public popUpService: PopUpMessageService,
              public projectRequestService: ProjectRequestService,
              public questionaryControlService: QuestionaryControlService,
              public boundariesService: BoundariesService) {
  }

  openProjectRequest(projectRequest) {
    this.dialog.closeAll();
    this.projectRequestDialogRef = this.dialog.open(dialogsMap['customer-project-request-dialog'], customerProjectRequestDialogConfig);
    this.projectRequestDialogRef
      .afterClosed()
      .subscribe(result => {
        this.projectRequestDialogRef = null;
      });

    this.projectRequestDialogRef.componentInstance.projectRequest = projectRequest;
    this.projectRequestDialogRef.componentInstance.onCompanyHire = new EventEmitter<any>();
    this.projectRequestDialogRef.componentInstance.onCompanyDecline = new EventEmitter<any>();
    this.projectRequestDialogRef.componentInstance.onCompanyHire.subscribe(
      projectRequest => {
        this.hireCompanyConfirm(projectRequest);
      },
      err => {
        console.log(err);
      }
    );

    this.projectRequestDialogRef.componentInstance.onCompanyDecline.subscribe(
      projectRequest => {
        this.declineCompanyConfirm(projectRequest);
      },
      err => {
        console.log(err);
        this.popUpService.showError(JSON.parse(err.error).message);
      }
    );
  }

  hireCompanyConfirm(projectRequest) {
    let properties = {
      title: 'Are you sure that you want to hire current Pro?',
      message: 'By hiring current Pro - other Pros will receive decline from you',
      OK: 'Confirm',
      CANCEL: 'Cancel'
    };
    this.confirmDialogRef = this.dialog.open(dialogsMap['confirm-dialog'], confirmDialogConfig);
    this.confirmDialogRef
      .afterClosed()
      .subscribe(result => {
        this.confirmDialogRef = null;
      });
    this.confirmDialogRef.componentInstance.properties = properties;
    this.confirmDialogRef.componentInstance.object = projectRequest;
    this.confirmDialogRef.componentInstance.onConfirm.subscribe(
      () => {
        this.hireCompany(projectRequest);
      },
      err => {
        console.log(err);
        this.popUpService.showError(JSON.parse(err.error).message);
      }
    );
  }

  hireCompany(projectRequest: ProjectRequest) {
    this.projectRequestService.hire(projectRequest.id).subscribe(
      () => {
        if (this.securityService.isAuthenticated()) {
          this.onProjectsUpdate.emit();
        }
        this.popUpService.showSuccess(`You have hired <b>${projectRequest.company.name}</b> for your <b>${this.project.serviceType}</b> project`)
      },
      err => {
        console.log(err);
        this.popUpService.showError(JSON.parse(err.error).message);
      }
    );
  }


  declineCompanyConfirm(projectRequest) {
    this.confirmDialogRef = this.dialog.open(dialogsMap['decline-contractor-dialog'], completeProjectDialogConfig);
    this.confirmDialogRef
      .afterClosed()
      .subscribe(result => {
        this.confirmDialogRef = null;
      });

    this.confirmDialogRef.componentInstance.projectRequest = projectRequest;
    this.confirmDialogRef.componentInstance.onConfirm.subscribe(
      (body) => {
        this.declineCompany(projectRequest.id, body);
      },
      err => {
        console.log(err);
        this.popUpService.showError(JSON.parse(err.error).message);
      }
    );
  }


  declineCompany(projectRequestId, body) {
    this.dialog.closeAll();
    this.projectRequestService.decline(projectRequestId, body).subscribe(
      response => {
        if (this.securityService.isAuthenticated()) {
          this.onProjectsUpdate.emit();
        }
      },
      err => {
        console.log(err);
        this.popUpService.showError(JSON.parse(err.error).message);
      }
    );
  }

  completeProjectConfirm(project) {

    let hiredProjectRequests = project.projectRequests.filter((projectRequest: ProjectRequest) => {
      return projectRequest.status == ProjectRequest.Status.HIRED;
    });

    if (hiredProjectRequests.length > 0) {
      let closeProjectRequest: CloseProjectRequest = {
        action: 'COMPLETE',
        reason: 'DONE'
      };
      this.completeProject(project, closeProjectRequest);
      return;
    }

    this.confirmDialogRef = this.dialog.open(dialogsMap['complete-project-dialog'], completeProjectDialogConfig);
    this.confirmDialogRef
      .afterClosed()
      .subscribe(result => {
        this.confirmDialogRef = null;
      });

    this.confirmDialogRef.componentInstance.project = project;
    this.confirmDialogRef.componentInstance.onConfirm.subscribe(
      (body) => {
        this.completeProject(project, body);
      },
      err => {
        console.log(err);
        this.popUpService.showError(JSON.parse(err.error).message);
      }
    );

  }

  completeProject(project, body) {
    this.projectService
      .closeProject(project.id, body)
      .subscribe(
        response => {
          if (this.securityService.isAuthenticated()) {
            this.onProjectsUpdate.emit();
          }
          if (this.confirmDialogRef) {
            this.confirmDialogRef.close();
          }
          this.popUpService.showSuccess(`Your <b>${project.serviceType}</b> project marked as completed`)
        },
        err => {
          console.log(err);
          this.popUpService.showError(JSON.parse(err.error).message);
        });
  }

  cancelProjectConfirm(project) {

    this.confirmDialogRef = this.dialog.open(dialogsMap['cancel-project-dialog'], completeProjectDialogConfig);
    this.confirmDialogRef
      .afterClosed()
      .subscribe(result => {
        this.confirmDialogRef = null;
      });

    this.confirmDialogRef.componentInstance.project = project;
    this.confirmDialogRef.componentInstance.onConfirm.subscribe(
      (body) => {
        this.cancelProject(project, body);
      },
      err => {
        console.log(err);
        this.popUpService.showError(JSON.parse(err.error).message);
      }
    );

  }

  cancelProject(project, body) {
    this.projectService
      .closeProject(project.id, body)
      .subscribe(
        response => {
          if (this.securityService.isAuthenticated()) {
            this.onProjectsUpdate.emit();
          }
          this.confirmDialogRef.close();
        },
        err => {
          console.log(err);
          this.popUpService.showError(JSON.parse(err.error).message);
        });
  }

  openQuestionary(serviceType: ServiceType, zip = undefined): void {
    if (!this.securityService.hasRole(Role.ANONYMOUS) && !this.securityService.hasRole(Role.CUSTOMER)) return;
    if (zip) {
      this.questionaryControlService.zip = zip;

      this.zipIsChecking = true;
      this.boundariesService.isZipSupported(this.questionaryControlService.zip).subscribe(
        supported => {
          this.zipIsChecking = false;
          this.zipIsSupported = supported;

          if (this.zipIsSupported) {
            this.questionaryControlService.currentQuestionIndex++;
            this.questionaryControlService.withZip = true;
            this.getQuestianary(serviceType);
          } else {
            this.openZipNotSupportedModal(zip);
            this.questionaryControlService.resetQuestionaryForm()
          }

        },
        error => {
          this.zipIsChecking = false;
          this.popUpService.showError(getErrorMessage(error))
        }
      );
    } else {
      this.getQuestianary(serviceType);
    }

  }

  openQuestionaryForCompany(serviceType: ServiceType, companyId: string = ''): void {
    this.getQuestianary(serviceType, companyId);
  }

  private openQuestionaryModal(serviceType, questionary, companyId: string = '') {
    this.dialog.closeAll();
    this.questionaryDialogRef = this.dialog.open(dialogsMap['questionary-dialog'], questionaryDialogConfig);
    this.questionaryDialogRef
      .afterClosed()
      .subscribe(result => {
        this.questionaryControlService.resetQuestionaryForm();
        this.reset();
        this.questionaryDialogRef = null;
      });
    this.questionaryDialogRef.componentInstance.serviceType = serviceType;
    this.questionaryDialogRef.componentInstance.companyId = companyId;
    if (questionary && questionary.length > 0) {
      this.questionaryDialogRef.componentInstance.questionary = questionary;
      this.questionaryControlService.updateQuestionaryTotalLength(questionary.length);
    }
  };

  // TODO: Prevent double getQuestionary from server
  getQuestianary(serviceType, companyId: string = ''): void {
    this.questionaryControlService.serviceType = serviceType;
    this.openQuestionaryModal(serviceType, null, companyId);
    // TODO: Check consequences! Comment code and replace with function without questionary. Check consequences!
    // this.serviceTypeService.getQuestionary(serviceType.id).subscribe(
    //   (questionary: Array<QuestionaryBlock>) => {
    //     this.openQuestionaryModal(serviceType, questionary, companyId)
    //   },
    //   err => {
    //     this.popUpService.showError(getErrorMessage(err));
    //   });
  }

  closeProject(project: ContractorProjectShort) {
    this.projectRequestService.closeProject(project.id, false).subscribe(
      response => {
        this.popUpService.showInfo("<b>" + project.serviceType + "</b>" + " closed");
        this.onProjectsUpdate.emit();
      },
      err => {
        console.log(err);
        this.popUpService.showError(JSON.parse(err.error).message);
      }
    );
  }

  leaveProject(project: ContractorProjectShort) {
    // TODO: Check text
    let properties = {
      title: "Are you sure want to leave <b>" + project.serviceType + "</b> project",
      message: "By proceeding, a project will be closed for you, and no further guarantees regarding last would be provided.",
      OK: "Leave",
      CANCEL: "No"
    };
    this.confirmDialogRef = this.dialog.open(dialogsMap['confirm-dialog'], confirmDialogConfig);
    this.confirmDialogRef
      .afterClosed()
      .subscribe(result => {
        this.confirmDialogRef = null;
      });
    this.confirmDialogRef.componentInstance.properties = properties;
    this.confirmDialogRef.componentInstance.onConfirm = new EventEmitter<boolean>();
    this.confirmDialogRef.componentInstance.onConfirm.subscribe(
      () => {
        this.projectRequestService.closeProject(project.id, true).subscribe(
          response => {
            this.popUpService.showInfo("You leaved <b>" + project.serviceType + "</b>" + " project");
            this.onProjectsUpdate.emit();
          },
          err => {
            console.log(err);
            this.popUpService.showError(JSON.parse(err.error).message);
          }
        );
      },
      err => {
        console.log(err)
      }
    );

  }

  openZipNotSupportedModal(zip: string) {

    let properties = {
      title: "Sorry, we are not in your area yet",
      message: 'Home Improve is not serving <b>' + zip + '</b>. We are coming to your area soon.',
      OK: 'Ok',
      confirmOnly: true
    };

    this.dialog.closeAll();

    this.confirmDialogRef = this.dialog.open(dialogsMap['confirm-dialog'], confirmDialogConfig);
    this.confirmDialogRef.componentInstance.properties = properties;
    this.confirmDialogRef
      .afterClosed()
      .subscribe(result => {
        this.questionaryControlService.resetQuestionaryForm()
        this.reset()
      });
  };

  reset() {
    this.zipIsSupported = true;
  }

}
