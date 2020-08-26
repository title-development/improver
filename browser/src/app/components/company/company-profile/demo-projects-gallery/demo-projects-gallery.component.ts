import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { DemoProject, Pagination, Review } from "../../../../model/data-model";
import { DemoProjectService } from "../../../../api/services/demo-project.service";
import { SecurityService } from "../../../../auth/security.service";
import { Role } from "../../../../model/security-model";
import { PopUpMessageService } from "../../../../api/services/pop-up-message.service";
import { Router } from "@angular/router";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { dialogsMap } from '../../../../shared/dialogs/dialogs.state';
import { confirmDialogConfig } from '../../../../shared/dialogs/dialogs.configs';
import { getErrorMessage } from "../../../../util/functions";
import { Subject } from "rxjs";
import { finalize, takeUntil } from "rxjs/operators";
import { RestPage } from "../../../../api/models/RestPage";

@Component({
  selector: 'demo-projects-gallery',
  templateUrl: './demo-projects-gallery.component.html',
  styleUrls: ['./demo-projects-gallery.component.scss']
})
export class DemoProjectsGalleryComponent implements OnInit, OnDestroy {
  @Input()
  public companyId: any;
  @Input()
  public editMode : boolean = false;

  private readonly destroyed$ = new Subject<void>();
	maxItemPerPage: number = 6;
	contractorDemoProject = {
		projects: [],
		pagination: new Pagination(0, this.maxItemPerPage),
		pageable: new RestPage<DemoProject>()
	};
  projectsProcessing: boolean = true;
  Role = Role;
  confirmDialogRef: MatDialogRef<any>;

  emptyDemoProject: DemoProject = {
    name: "",
    coverUrl: "",
    date: "",
    description: "",
    price: "",
    location: {
      state: "",
      city: "",
      streetAddress: "",
      zip: "",
    },
    serviceTypes: [],
    images: []
  };

  constructor (private securityService: SecurityService,
               private demoProjectService: DemoProjectService,
               public popUpMessageService: PopUpMessageService,
               public dialog: MatDialog,
               public router: Router) {

  }

  ngOnInit() {
    this.getAllDemoProjects();
  }

  getAllDemoProjects() {
    this.projectsProcessing = true;
    this.demoProjectService.getAllDemoProjects(this.companyId, this.contractorDemoProject.pagination)
        .pipe(
          takeUntil(this.destroyed$),
          finalize( () => this.projectsProcessing = false)
        )
        .subscribe((pageable: RestPage<DemoProject>) => {
        this.contractorDemoProject.projects = pageable.content;
        this.contractorDemoProject.pageable = pageable;
      },
      err => {
        this.projectsProcessing = false;
        console.error(err)
      }
    )
  }

  showMoreProjects(){
    this.projectsProcessing = true;
    this.demoProjectService.getAllDemoProjects(this.companyId, this.contractorDemoProject.pagination.nextPage())
      .pipe(
        takeUntil(this.destroyed$),
        finalize( () => this.projectsProcessing = false)
      )
      .subscribe( (pageable: RestPage<DemoProject>) => {
        this.contractorDemoProject.projects = [...this.contractorDemoProject.projects, ...pageable.content];
        this.contractorDemoProject.pageable = pageable;
      },
        err => {
      	this.popUpMessageService.showError(getErrorMessage(err));
					this.projectsProcessing = false;
				})
  }

  trackById(index, item: Review) {
    return item.id
  }

  deleteDemoProjectConfirm(project: DemoProject) {
    let properties = {
      title: "Are you sure that you want to delete current project?",
      message: "",
      OK: "Confirm",
      CANCEL: "Cancel"
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
        this.deleteDemoProject(project.id);
      },
      err => {
        console.error(err)
      }
    );
  }

  deleteDemoProject(id) {
    this.demoProjectService.delete(this.companyId, id)
      .subscribe(
        response => {
          this.getAllDemoProjects()
        },
        err => {
          console.error(err);
          this.popUpMessageService.showError(getErrorMessage(err))
        });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

}
