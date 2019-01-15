import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CompanyProfile, GalleryProject, ServiceType } from "../../../model/data-model";
import { ActivatedRoute, Router } from "@angular/router";
import { Constants } from "../../../util/constants";
import { Messages } from "../../../util/messages";
import { GalleryProjectService } from "../../../api/services/gallery-project.service";
import { SecurityService } from "../../../auth/security.service";
import { ServiceTypeService } from "../../../api/services/service-type.service";
import * as Swiper from 'swiper/dist/js/swiper.min.js';
import { CompanyService } from "../../../api/services/company.service";
import { PopUpMessageService } from "../../../util/pop-up-message.service";
import { customerGalleryDialogConfig } from "../../../shared/dialogs/dialogs.configs";
import { MatDialog, MatDialogRef } from "@angular/material";
import { forkJoin ,  combineLatest } from "rxjs";
import { dialogsMap } from '../../../shared/dialogs/dialogs.state';
import { getErrorMessage } from "../../../util/functions";

@Component({
  selector: 'app-company-gallery-project-viewer',
  templateUrl: './company-gallery-project-viewer.component.html',
  styleUrls: ['./company-gallery-project-viewer.component.scss']
})
export class CompanyGalleryProjectViewerComponent implements OnInit {

  galleryProject: GalleryProject;
  allServiceTypes: ServiceType[];
  selectedServices:  ServiceType[] = [];
  project: GalleryProject = new GalleryProject();
  userId: string;
  companyProfile: CompanyProfile;
  projectImages: any[];
  companyId: string;
  projectId: string;
  imagesGalleryDialogRef: MatDialogRef<any>;

  constructor(
    private route: ActivatedRoute,
    private serviceTypeService: ServiceTypeService,
    private galleryProjectService: GalleryProjectService,
    private companyService: CompanyService,
    public popUpMessageService: PopUpMessageService,
    public dialog: MatDialog,
    public securityService: SecurityService,
    public router: Router,
    public constants: Constants,
    public messages: Messages) {
    this.userId = this.securityService.getLoginModel().id;

    this.route.params.subscribe(params => {

      this.companyId = params['companyId'];
      this.projectId = params['projectId'];

      // this.getGalleryProject();
      // this.getProjectImages();
      // this.getServiceTypes();

      let requests = [
        this.serviceTypeService.serviceTypes$,
        this.galleryProjectService.get(this.companyId, this.projectId),
        this.galleryProjectService.getImages(this.companyId, this.projectId),
      ];

      combineLatest(requests).subscribe(result => {
          this.allServiceTypes = result[0];
          this.galleryProject = result[1];
          this.projectImages = result[2];
        },
        err => {
          console.log(err);
          if (err.status == 404) {
            this.router.navigate(['404'])
          } else {
            this.popUpMessageService.showError(err.statusText);
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
          console.log(err);
          this.popUpMessageService.showError(JSON.parse(err.error).message)
        });
  }

  getGalleryProject() {
    this.galleryProjectService.get(this.companyId, this.projectId)
      .subscribe(
        project => {
          this.project = project;
          this.galleryProject = project;
          this.selectedServices = this.project.serviceTypes;

        },
        err => {
          console.log(err);
          this.popUpMessageService.showError(JSON.parse(err.error).message)
        });
  }

  getCompanyProfile() {
    this.companyService.getProfile(this.companyId)
      .subscribe(
      companyProfile => {
        this.companyProfile = companyProfile;
      },
      err => {
        console.log(err);
        this.popUpMessageService.showError(JSON.parse(err.error).message)
      });
  }

  getProjectImages() {
    this.galleryProjectService.getImages(this.companyId, this.projectId)
      .subscribe(
        images => {
          this.projectImages = images;
        },
        err => {
          console.log(err);
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
