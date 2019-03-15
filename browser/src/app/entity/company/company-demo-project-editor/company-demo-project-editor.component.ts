import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, NgForm } from '@angular/forms';

import {DemoProject, ServiceType, SystemMessageType} from '../../../model/data-model';
import { ServiceTypeService } from '../../../api/services/service-type.service';
import {DemoProjectService} from '../../../api/services/demo-project.service';
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
  selector: 'company-demo-project-editor-page',
  templateUrl: './company-demo-project-editor.component.html',
  styleUrls: ['./company-demo-project-editor.component.scss']
})
export class CompanyDemoProjectEditorComponent implements OnInit {

  minDate: string;
  maxDate: string;

  demoProject: DemoProject = {
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
  project: DemoProject = new DemoProject();
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
              private demoProjectService: DemoProjectService,
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
        this.demoProjectService.get(this.companyId, this.projectId),
        this.demoProjectService.getImages(this.companyId, this.projectId),
      ];

      combineLatest(requests).subscribe(result => {
          this.allServiceTypes = result[0];
          this.demoProject = result[1];
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

  getDemoProject() {
    this.demoProjectService.get(this.companyId, this.projectId)
      .subscribe(
        project => {
          this.demoProject = project;
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

  onUpdateDemoProject() {
    this.updateDemoProject(this.demoProject.id, this.demoProject);
  }

  updateDemoProject(id, demoProject) {
    this.demoProjectService.update(id, demoProject)
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
    this.demoProjectService.getImages(this.companyId, this.projectId)
      .subscribe(
        images => {
          this.projectImages = images;
        },
        err => {
          console.log(err);
        });
  }

  // TODO: Implementation
  publishDemoProject() {
    this.popUpMessageService.showMessage(this.popUpMessageService.METHOD_NOT_IMPLEMENTED);
    throw new Error('Method not implemented.');
  }

  deleteDemoProject(id) {
    this.demoProjectService.delete(id)
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
