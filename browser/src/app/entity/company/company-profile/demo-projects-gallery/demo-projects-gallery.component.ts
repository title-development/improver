import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import {DemoProject, Review} from "../../../../model/data-model";
import {DemoProjectService} from "../../../../api/services/demo-project.service";
import { SecurityService } from "../../../../auth/security.service";
import { Role } from "../../../../model/security-model";
import { PopUpMessageService } from "../../../../util/pop-up-message.service";
import { Router } from "@angular/router";
import { MatDialog, MatDialogRef } from "@angular/material";
import { dialogsMap } from '../../../../shared/dialogs/dialogs.state';
import { confirmDialogConfig } from '../../../../shared/dialogs/dialogs.configs';

@Component({
  selector: 'demo-projects-gallery',
  templateUrl: './demo-projects-gallery.component.html',
  styleUrls: ['./demo-projects-gallery.component.scss']
})
export class DemoProjectsGalleryComponent implements OnInit {
  @Input()
  public companyId: any;
  @Input()
  public editMode : boolean = false;

  projects: DemoProject[] = [];
  Role = Role;
  preSavingProject = false;
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

  constructor (
    private securityService: SecurityService,
    private demoProjectService: DemoProjectService,
    public popUpMessageService: PopUpMessageService,
    public dialog: MatDialog,
    public router: Router
  ) {

  }

  ngOnInit() {
    this.getDemoProjects();
  }

  getDemoProjects() {
    this.demoProjectService.getAll(this.companyId).subscribe(
      (projects) => {
        this.projects = projects;
      },
      (error) => {
        console.log(error)
      }
    )
  }

  trackById(index, item: Review) {
    return item.id
  }

  preSaveDemoProject() {
    this.preSavingProject = true;
    this.demoProjectService.preSave(this.emptyDemoProject)
      .subscribe(
        demoProject => {
          this.preSavingProject = false;
          this.router.navigate(['/companies', this.companyId, 'projects', demoProject.id, 'add']);
        },
        err => {
          console.log(err);
          this.preSavingProject = false;
          this.popUpMessageService.showError(err.error)
        });
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
        console.log(err)
      }
    );
  }

  deleteDemoProject(id) {
    this.demoProjectService.delete(id)
      .subscribe(
        response => {
          this.getDemoProjects()
        },
        err => {
          console.log(err);
          this.popUpMessageService.showError(JSON.parse(err.error).message)
        });
  }

}
