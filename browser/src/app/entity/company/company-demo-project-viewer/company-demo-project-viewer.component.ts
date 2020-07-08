import { Component, OnInit } from '@angular/core';
import { CompanyProfile, DemoProject, ServiceType } from "../../../model/data-model";
import { ActivatedRoute, Router } from "@angular/router";
import { Constants } from "../../../util/constants";
import { Messages } from "../../../util/messages";
import { DemoProjectService } from "../../../api/services/demo-project.service";
import { SecurityService } from "../../../auth/security.service";
import { ServiceTypeService } from "../../../api/services/service-type.service";
import { CompanyService } from "../../../api/services/company.service";
import { PopUpMessageService } from "../../../util/pop-up-message.service";
import { customerGalleryDialogConfig } from "../../../shared/dialogs/dialogs.configs";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { combineLatest } from "rxjs";
import { dialogsMap } from '../../../shared/dialogs/dialogs.state';
import { getErrorMessage } from "../../../util/functions";

@Component({
  selector: 'app-company-demo-project-viewer',
  templateUrl: './company-demo-project-viewer.component.html',
  styleUrls: ['./company-demo-project-viewer.component.scss']
})
export class CompanyDemoProjectViewerComponent implements OnInit {

  demoProject: DemoProject;
  allServiceTypes: ServiceType[];
  selectedServices:  ServiceType[] = [];
  project: DemoProject = new DemoProject();
  companyProfile: CompanyProfile;
  projectImages: any[];
  companyId: string;
  projectId: string;
  imagesGalleryDialogRef: MatDialogRef<any>;

  constructor(private route: ActivatedRoute,
              private serviceTypeService: ServiceTypeService,
              private demoProjectService: DemoProjectService,
              private companyService: CompanyService,
              public popUpMessageService: PopUpMessageService,
              public dialog: MatDialog,
              public securityService: SecurityService,
              public router: Router,
              public constants: Constants,
              public messages: Messages) {

    this.route.params.subscribe(params => {

      this.companyId = params['companyId'];
      this.projectId = params['projectId'];

      let requests = [
        this.serviceTypeService.serviceTypes$,
        this.demoProjectService.get(this.companyId, this.projectId),
        this.demoProjectService.getImages(this.companyId, this.projectId),
      ];

      combineLatest(requests).subscribe(result => {
          this.allServiceTypes = result[0];
          this.demoProject = result[1];
          this.projectImages = result[2];
        },
        err => {
          console.error(err);
          if (err.status == 404) {
            this.router.navigate(['404'])
          } else {
            this.popUpMessageService.showError(getErrorMessage(err));
          }
        });

      this.getCompanyProfile();

    });
  }

  ngOnInit() {
  }

  getServiceTypes() {
    this.serviceTypeService.serviceTypes$
      .subscribe(
        serviceTypes => {
          this.allServiceTypes = serviceTypes;
        },
        err => {
          console.error(err);
          this.popUpMessageService.showError(getErrorMessage(err))
        });
  }

  getDemoProject() {
    this.demoProjectService.get(this.companyId, this.projectId)
      .subscribe(
        project => {
          this.project = project;
          this.demoProject = project;
          this.selectedServices = this.project.serviceTypes;

        },
        err => {
          this.popUpMessageService.showError(getErrorMessage(err))
        });
  }

  getCompanyProfile() {
    this.companyService.getProfile(this.companyId)
      .subscribe(
      companyProfile => {
        this.companyProfile = companyProfile;
      },
      err => {
        console.error(err);
        this.popUpMessageService.showError(getErrorMessage(err))
      });
  }

  getProjectImages() {
    this.demoProjectService.getImages(this.companyId, this.projectId)
      .subscribe(
        images => {
          this.projectImages = images;
        },
        err => {
          console.error(err);
          this.popUpMessageService.showError(getErrorMessage(err))
        });
  }

  openGallery(index) {
    this.dialog.closeAll();
    this.imagesGalleryDialogRef = this.dialog.open(dialogsMap['image-viewer'], customerGalleryDialogConfig);
    let images = [];
    images.push(...this.projectImages);
    this.imagesGalleryDialogRef.componentInstance.gallery = images;
    this.imagesGalleryDialogRef.componentInstance.galleryActiveIndex = index;
  }

}
