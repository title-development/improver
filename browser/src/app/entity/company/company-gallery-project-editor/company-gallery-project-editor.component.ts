import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, NgForm } from '@angular/forms';

import { GalleryProject, ServiceType, SystemMessageType } from '../../../model/data-model';
import { ServiceTypeService } from '../../../api/services/service-type.service';
import { GalleryProjectService } from '../../../api/services/gallery-project.service';
import { SecurityService } from '../../../auth/security.service';
import { Constants } from '../../../util/constants';
import { Messages } from '../../../util/messages';
import { Observable ,  forkJoin ,  combineLatest } from 'rxjs';
import { PopUpMessageService } from '../../../util/pop-up-message.service';
import { TricksService } from '../../../util/tricks.service';
import { addDays, addYears, format } from 'date-fns';
import { MatDialogRef } from "@angular/material";
import { getErrorMessage } from "../../../util/functions";
import { map, startWith } from "rxjs/internal/operators";


@Component({
  selector: 'company-gallery-project-editor-page',
  templateUrl: './company-gallery-project-editor.component.html',
  styleUrls: ['./company-gallery-project-editor.component.scss']
})
export class CompanyGalleryProjectEditorComponent implements OnInit {

  minDate: string;
  maxDate: string;

  galleryProject: GalleryProject = {
    name: "",
    coverUrl: "",
    date: "",
    description: "",
    price: "",
    location: {
      state: "",
      city: "",
      streetAddress: "",
      zip: ""
    },
    serviceTypes: [],
    images: [],
  };

  projectImages: any[] = [];

  allServiceTypes: ServiceType[];
  // selectedServices: ServiceType[] = [];
  project: GalleryProject = new GalleryProject();
  newMode: boolean = false;
  filteredStates = [];
  selectedControl = new FormControl();
  filteredServiceTypes: Observable<ServiceType[]>;
  userId: string;
  companyId: string;
  projectId: string;

  constructor(public route: ActivatedRoute,
              public popUpMessageService: PopUpMessageService,
              private trickService: TricksService,
              private serviceTypeService: ServiceTypeService,
              private galleryProjectService: GalleryProjectService,
              public securityService: SecurityService,
              public router: Router,
              public constants: Constants,
              public messages: Messages) {
    this.userId = this.securityService.getLoginModel().id;
    this.minDate = format(addYears(new Date(), -20), 'YYYY-MM-DD');
    this.maxDate = format(addDays(new Date(), 1), 'YYYY-MM-DD');

    this.route.params.subscribe(params => {

      this.companyId = params['companyId'];
      this.projectId = params['projectId'];
      this.newMode = params['mode'] != 'edit';

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
            this.popUpMessageService.showError(getErrorMessage(err));
          }
        });

    });
  }

  ngOnInit() {
  }

  filter(name: string, arr: any): any[] {
    return arr.filter(option => new RegExp(`^${name}`, 'gi').test(option.name));
  }

  autocompleteSearch(search) {
    const regExp: RegExp = new RegExp(`^${search}`, 'i');
    //TODO: refactor search
    this.filteredStates = this.constants.states.filter(state => {
      let res: boolean;
      for (let key in state) {
        res = regExp.test(state[key]);
        if (res) {
          break;
        }
      }
      return res;
    });
  }

  displayFn(item: any): string {
    return item ? item.name : '';
  }

  trackByService(index: number, item: any) {
    return item.id;
  };

  getServiceTypes() {
    this.serviceTypeService.serviceTypes$
      .subscribe(
        serviceTypes => {
          this.allServiceTypes = serviceTypes;
          this.filteredServiceTypes = this.selectedControl.valueChanges.pipe(
            startWith(null),
            map(serviceType => serviceType && typeof serviceType === 'object' ? serviceType.name : serviceType),
            map(name => name ? this.filter(name, this.allServiceTypes) : this.allServiceTypes ? this.allServiceTypes.slice() : []),
          )

        },
        err => {
          console.log(err);
        });
  }

  getGalleryProject() {
    this.galleryProjectService.get(this.companyId, this.projectId)
      .subscribe(
        project => {
          this.galleryProject = project;
        },
        err => {
          console.log(err);
        });
  }

  // TODO: Implement or remove this method
  addProjectService() {
    this.popUpMessageService.showMessage(this.popUpMessageService.METHOD_NOT_IMPLEMENTED);
    throw new Error('Method not implemented.');
  }

  // TODO: Implement or remove this method
  removeProjectService(service) {
    this.popUpMessageService.showMessage(this.popUpMessageService.METHOD_NOT_IMPLEMENTED);
    throw new Error('Method not implemented.');
  }

  onUpdateGalleryProject() {
    this.updateGalleryProject(this.galleryProject.id, this.galleryProject);
  }

  updateGalleryProject(id, galleryProject) {
    this.galleryProjectService.update(id, galleryProject)
      .subscribe(
        response => {
          this.popUpMessageService.showMessage({
            text: 'Project is updated',
            type: SystemMessageType.SUCCESS
          });
          this.router.navigate(['companies', this.companyId, 'projects', this.projectId, 'view'])
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
        });
  }

  // TODO: Implementation
  publishGalleryProject() {
    this.popUpMessageService.showMessage(this.popUpMessageService.METHOD_NOT_IMPLEMENTED);
    throw new Error('Method not implemented.');
  }

  deleteGalleryProject(id) {
    this.galleryProjectService.delete(id)
      .subscribe(
        response => {
          this.router.navigate(['/companies', this.companyId]);
        },
        err => {
          console.log(err);
          this.popUpMessageService.showError(err.statusText)
        });
  }

  trackBy(index, item): boolean {
    return item.name;
  }

}
