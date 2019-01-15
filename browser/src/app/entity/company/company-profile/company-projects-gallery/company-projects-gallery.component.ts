import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import { GalleryProject, Review } from "../../../../model/data-model";
import { GalleryProjectService } from "../../../../api/services/gallery-project.service";
import { SecurityService } from "../../../../auth/security.service";
import { Role } from "../../../../model/security-model";
import { PopUpMessageService } from "../../../../util/pop-up-message.service";
import { Router } from "@angular/router";
import { MatDialog, MatDialogRef } from "@angular/material";
import { dialogsMap } from '../../../../shared/dialogs/dialogs.state';
import { confirmDialogConfig } from '../../../../shared/dialogs/dialogs.configs';

@Component({
  selector: 'company-projects-gallery',
  templateUrl: './company-projects-gallery.component.html',
  styleUrls: ['./company-projects-gallery.component.scss']
})
export class CompanyProjectsGalleryComponent implements OnInit {
  @Input()
  public companyId: any;
  @Input()
  public editMode : boolean = false;

  projects : GalleryProject[] = [];
  Role = Role;
  preSavingProject = false;
  confirmDialogRef: MatDialogRef<any>;

  emptyGalleryProject: GalleryProject = {
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
    private galleryProjectService: GalleryProjectService,
    public popUpMessageService: PopUpMessageService,
    public dialog: MatDialog,
    public router: Router
  ) {

  }

  ngOnInit() {
    this.getGalleryProjects();
  }

  getGalleryProjects() {
    this.galleryProjectService.getAll(this.companyId).subscribe(
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

  preSaveGalleryProject() {
    this.preSavingProject = true;
    this.galleryProjectService.preSave(this.emptyGalleryProject)
      .subscribe(
        galleryProject => {
          this.preSavingProject = false;
          this.router.navigate(['/companies', this.companyId, 'projects', galleryProject.id, 'add']);
        },
        err => {
          console.log(err);
          this.preSavingProject = false;
          this.popUpMessageService.showError(err.error)
        });
  }

  deleteGalleryProjectConfirm(project: GalleryProject) {
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
        this.deleteGalleryProject(project.id);
      },
      err => {
        console.log(err)
      }
    );
  }

  deleteGalleryProject(id) {
    this.galleryProjectService.delete(id)
      .subscribe(
        response => {
          this.getGalleryProjects()
        },
        err => {
          console.log(err);
          this.popUpMessageService.showError(JSON.parse(err.error).message)
        });
  }

}
