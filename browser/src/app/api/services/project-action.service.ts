import { EventEmitter, Injectable } from '@angular/core';
import {
  completeProjectDialogConfig,
  confirmDialogConfig,
  customerProjectRequestDialogConfig,
  questionaryDialogConfig
} from '../../shared/dialogs/dialogs.configs';
import { CloseProjectRequest, ContractorProjectShort, CustomerProject } from '../../model/data-model';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ProjectService } from './project.service';
import { PopUpMessageService } from './pop-up-message.service';
import { ProjectRequestService } from './project-request.service';
import { QuestionaryControlService } from './questionary-control.service';
import { SecurityService } from '../../auth/security.service';
import { dialogsMap } from '../../shared/dialogs/dialogs.state';
import { ServiceTypeService } from './service-type.service';
import { getErrorMessage } from '../../util/functions';
import { ProjectRequest } from '../models/ProjectRequest';
import { BoundariesService } from './boundaries.service';
import { Role } from '../../model/security-model';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { debounceTime, first } from 'rxjs/operators';
import { ReviewService } from "./review.service";
import { ErrorHandler } from "../../util/handlers/error-handler";
import { CustomerSuggestionService } from "./customer-suggestion.service";
import { NavigationHelper } from "../../util/helpers/navigation-helper";
import { Project } from "../models/Project";

@Injectable()
export class ProjectActionService {

  projectRequestDialogRef: MatDialogRef<any>;
  projectId = '';
  project: CustomerProject;
  confirmDialogRef: MatDialogRef<any>;
  onProjectsUpdate: Observable<any>;
  onCloseProjectRequestDialog: EventEmitter<any> = new EventEmitter<any>();
  zipIsChecking = false;
  zipIsSupported = true;

  private DEBOUNCE_TIME: number = 300;
  private questionaryDialogRef: MatDialogRef<any>;
  private projectUpdateSubject: Subject<any> = new Subject();

  constructor(public dialog: MatDialog,
              public securityService: SecurityService,
              public projectService: ProjectService,
              public serviceTypeService: ServiceTypeService,
              public popUpService: PopUpMessageService,
              public projectRequestService: ProjectRequestService,
              public questionaryControlService: QuestionaryControlService,
              public customerSuggestionService: CustomerSuggestionService,
              public boundariesService: BoundariesService,
              private reviewService: ReviewService,
              private router: Router,
              private errorHandler: ErrorHandler,
              private navigationHelper: NavigationHelper) {
    //avoid duplicate project update event emitting
    this.onProjectsUpdate = this.projectUpdateSubject.pipe(debounceTime(this.DEBOUNCE_TIME))
  }

  openProjectRequest(projectRequestId) {
    this.dialog.closeAll();
    this.projectRequestDialogRef = this.dialog.open(dialogsMap['customer-project-request-dialog'], customerProjectRequestDialogConfig);
    let clearHash = this.projectRequestDialogRef.componentInstance.clearHash;
    this.projectRequestDialogRef
      .afterClosed()
      .subscribe(result => {
        this.projectRequestDialogRef = null;
        this.onCloseProjectRequestDialog.emit();
        clearHash.subscribe( clearHash => {
          if (clearHash) {
            this.navigationHelper.removeHash();
          }
        });
      });

    this.projectRequestDialogRef.componentInstance.projectRequestId = projectRequestId;
    this.projectRequestDialogRef.componentInstance.onCompanyHire.subscribe(
      projectRequest => {
        this.hireCompanyConfirm(projectRequest);
      },
      err => {
        console.error(err);
      }
    );

    this.projectRequestDialogRef.componentInstance.onCompanyDecline.subscribe(
      projectRequest => {
        this.declineCompanyConfirm(projectRequest);
      },
      err => {
        console.error(err);
        this.popUpService.showError(getErrorMessage(err));
      }
    );
  }


  //TODO refactor hire dialog
  hireCompanyConfirm(projectRequest) {
    let properties = {
      title: 'Are you sure that you want to accept Pros offer?',
      message: 'By accepting the current Pro offer - all other Pros will be declined on your behalf',
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
        console.error(err);
        this.popUpService.showError(getErrorMessage(err));
      }
    );
  }

  hireCompany(projectRequest: ProjectRequest) {
    this.projectRequestService.hire(projectRequest.id).subscribe(
      () => {
        if (this.securityService.isAuthenticated()) {
          this.projectUpdated()
        }
        this.popUpService.showSuccess(`You have accepted offer <b>${projectRequest.company.name}</b> for your <b>${this.project.serviceType}</b> project`);
      },
      err => {
        console.error(err);
        this.popUpService.showError(getErrorMessage(err));
      }
    );
  }


  ////TODO refactor decline dialog
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
        console.error(err);
        this.popUpService.showError(getErrorMessage(err));
      }
    );
  }


  declineCompany(projectRequestId, body) {
    this.dialog.closeAll();
    this.projectRequestService.decline(projectRequestId, body).subscribe(
      response => {
        if (this.securityService.isAuthenticated()) {
          this.projectUpdated()
        }
      },
      err => {
        console.error(err);
        this.popUpService.showError(getErrorMessage(err));
      }
    );
  }

  completeProjectConfirm(project) {

    let hiredProjectRequests = project.projectRequests.filter((projectRequest: ProjectRequest) => {
      return projectRequest.status == ProjectRequest.Status.HIRED;
    });

    if (hiredProjectRequests.length) {
      let properties = {
        title: 'Completing project',
        message: `Do you want to complete project? <br/>Note. We assume, ${hiredProjectRequests[0].company.name} finished this project.`,
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
      this.confirmDialogRef.componentInstance.onConfirm.subscribe(
        () => {
          let closeProjectRequest: CloseProjectRequest = {
            action: 'COMPLETE',
            reason: 'DONE'
          };
          this.completeProject(project, closeProjectRequest);
        },
        err => {
          console.error(err);
        }
      );
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
        this.popUpService.showError(getErrorMessage(err));
      }
    );

  }

  completeProject(project, body) {
    this.projectService
      .closeProject(project.id, body)
      .subscribe(
        response => {
          if (this.securityService.isAuthenticated()) {
            this.projectUpdated()
          }
          if (this.confirmDialogRef) {
            this.confirmDialogRef.close();
          }
          this.popUpService.showSuccess(`Your <b>${project.serviceType}</b> project marked as completed`);
        },
        err => {
          console.error(err);
          this.popUpService.showError(getErrorMessage(err));
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
        console.error(err);
        this.popUpService.showError(getErrorMessage(err));
      }
    );

  }

  cancelProject(project, body) {
    this.projectService
      .closeProject(project.id, body)
      .subscribe(
        response => {
          if (this.securityService.isAuthenticated()) {
            this.projectUpdated()
          }
          this.confirmDialogRef.close();
        },
        err => {
          console.error(err);
          this.popUpService.showError(getErrorMessage(err));
        });
  }

  openQuestionaryWithLastZipCode(selected) {
    if (localStorage.getItem('zipCode')) {
      this.openQuestionary(selected, localStorage.getItem('zipCode'));
    } else if (this.securityService.hasRole(Role.CUSTOMER)) {
      this.customerSuggestionService.lastCustomerZipCode$
        .pipe(first())
        .subscribe(lastCustomerZipCode => {
          this.openQuestionary(selected, lastCustomerZipCode);
        });
    } else {
      this.openQuestionary(selected);
    }
  }

  openQuestionary(selected, zip = undefined): void {
    switch (this.securityService.getRole()) {
      case Role.INCOMPLETE_PRO:
        event.preventDefault();
        event.stopPropagation();
        this.router.navigate(['/', 'signup-pro', 'company']);
        break;
      case Role.CUSTOMER:
      case Role.ANONYMOUS:
        if (zip) {
          this.questionaryControlService.zip = zip;

          this.zipIsChecking = true;
          this.boundariesService.isZipSupported(this.questionaryControlService.zip).subscribe(
            supported => {
              this.zipIsChecking = false;
              this.zipIsSupported = supported;

              if (this.zipIsSupported) {
                this.questionaryControlService.withZip = true;
                this.customerSuggestionService.saveUserSearchTerm(selected.name, this.questionaryControlService.zip, true);
                this.openQuestionaryModal(selected);
              } else {
                this.openZipNotSupportedModal(zip);
                this.questionaryControlService.resetQuestionaryForm();
              }
            },
            err => {
              this.zipIsChecking = false;
              this.popUpService.showError(getErrorMessage(err));
            }
          );
        } else {
          this.openQuestionaryModal(selected);
        }
        break;
      default:

        break;
    }
  }

  private openQuestionaryModal(selected) {
    this.dialog.closeAll();
    if (!selected.services) {
      this.questionaryControlService.serviceType = selected;
      this.questionaryControlService.withServiceType = true;
    } else {
      this.questionaryControlService.trade = selected;
      this.questionaryControlService.withServiceType = false;
    }
    this.checkPreQuestionary();
    this.questionaryDialogRef = this.dialog.open(dialogsMap['questionary-dialog'], questionaryDialogConfig);
    this.questionaryDialogRef
      .afterClosed()
      .subscribe(result => {
        this.questionaryControlService.clearPreSavedProject()
        this.questionaryControlService.resetQuestionaryForm();
        this.questionaryDialogRef = null;
        this.zipIsChecking = false;
        this.zipIsSupported = true;
      });
  }

  private checkPreQuestionary() {
    if (!this.questionaryControlService.withServiceType) {
      this.questionaryControlService.firstQuestionIndex--
    }
    if (!this.questionaryControlService.withZip) {
      this.questionaryControlService.firstQuestionIndex--
    }
    this.questionaryControlService.currentQuestionIndex = this.questionaryControlService.firstQuestionIndex;
  }

  closeProject(project: ContractorProjectShort) {
    let properties = {
      title: `Are you sure want to close <b>${project.serviceType}</b> project?`,
      message: 'By proceeding, a project will be closed for you, and no further guarantees regarding last would be provided.',
      OK: 'Close',
      CANCEL: 'No'
    };
    this.confirmDialogRef = this.dialog.open(dialogsMap['confirm-dialog'], confirmDialogConfig);
    this.confirmDialogRef
      .afterClosed()
      .subscribe(result => {
        this.confirmDialogRef = null;
      });
    this.confirmDialogRef.componentInstance.properties = properties;
    this.confirmDialogRef.componentInstance.onConfirm.subscribe( result => {
      this.projectRequestService.closeProject(project.id, false).subscribe(
        response => {
          this.popUpService.showInfo(`<b>${project.serviceType}</b> closed`);
          this.projectUpdated()
        },
        err => {
          console.error(err);
          this.popUpService.showError(getErrorMessage(err));
        }
      );
    })
  }

  sendRequestProjectReview(project: ContractorProjectShort) {
    let properties = {
        title: 'Request review',
        message: 'We will send an email to ask the customer for a review of the current project.',
        OK: 'Send',
        CANCEL: 'Cancel'
      };

    this.confirmDialogRef = this.dialog.open(dialogsMap['confirm-dialog'], confirmDialogConfig);
    this.confirmDialogRef
      .afterClosed()
      .subscribe(result => {
        this.confirmDialogRef = null;
      });
    this.confirmDialogRef.componentInstance.properties = properties;
    this.confirmDialogRef.componentInstance.onConfirm.subscribe(result => {
        this.reviewService.requestProjectReview(project.id).subscribe(
          response => {
            this.popUpService.showSuccess('Request review has been sent');
            this.projectUpdated();
          },
          err => {
            this.errorHandler.conflict(err, getErrorMessage(err));
            this.errorHandler.notFound(err, 'Unexpected error while requesting review');
            this.dialog.closeAll();
          }
        )
      }
    );
  }

  leaveProject(project: ContractorProjectShort) {
    let properties = {
      title: 'Are you sure want to leave <b>' + project.serviceType + '</b> project?',
      message: 'By proceeding, a project will be closed for you, and no further guarantees regarding last would be provided.',
      OK: 'Leave',
      CANCEL: 'No'
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
            this.popUpService.showInfo('You left <b>' + project.serviceType + '</b>' + ' project');
            this.projectUpdated();
          },
          err => {
            console.error(err);
            this.popUpService.showError(getErrorMessage(err));
          }
        );
      },
      err => {
        console.error(err);
      }
    );

  }

  openZipNotSupportedModal(zip: string) {

    let properties = {
      title: 'Sorry, we are not in your area yet',
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
        this.questionaryControlService.resetQuestionaryForm();
        this.zipIsSupported = true;
      });
  }

  projectUpdated(): void {
    this.projectUpdateSubject.next();
  }

  resubmitOrder(projectId: number) {
    this.projectService.submitProject(projectId)
      .subscribe(response => {
          this.projectUpdated()
          this.popUpService.showInfo(`Your project submitted successfully`)
          this.confirmDialogRef.close()
        },
        error => {
          this.popUpService.showError(getErrorMessage(error))
          this.confirmDialogRef.componentInstance.submitting = false;
        });
  }

  openSubmitOrderModal(project: Project | CustomerProject, reloadProject = false) {

    this.dialog.closeAll();

    this.confirmDialogRef = this.dialog.open(dialogsMap['submit-project-dialog'], confirmDialogConfig);
    this.confirmDialogRef.componentInstance.project = project;
    this.confirmDialogRef.componentInstance.reloadProject = reloadProject;

    this.confirmDialogRef.componentInstance.onConfirm.subscribe(() => this.resubmitOrder(project.id))

    this.confirmDialogRef
      .afterClosed()
      .subscribe(result => {
      });
  }

  cancelOrder(projectId: number) {
    this.projectService.deleteProject(projectId)
      .subscribe(() => this.projectUpdated());
    this.router.navigate(["/my/projects"])
  }

}
