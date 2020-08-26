import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, NgForm } from '@angular/forms';

import { DemoProject, ServiceType } from '../../../model/data-model';
import { ServiceTypeService } from '../../../api/services/service-type.service';
import { DemoProjectService } from '../../../api/services/demo-project.service';
import { SecurityService } from '../../../auth/security.service';
import { Constants } from '../../../util/constants';
import { TextMessages } from '../../../util/text-messages';
import { combineLatest, Observable } from 'rxjs';
import { PopUpMessageService } from '../../../api/services/pop-up-message.service';
import { TricksService } from '../../../api/services/tricks.service';
import { addDays, addYears, format } from 'date-fns';
import { getErrorMessage } from '../../../util/functions';
import { finalize, first, map, startWith } from 'rxjs/internal/operators';
import { ImagesUploaderComponent } from '../../../shared/image-uploader/image-uploader.component';
import { ComponentCanDeactivate } from '../../../auth/router-guards/component-can-deactivate.guard';
import { FormHasChangesDirective } from '../../../directives/form-has-changes.directive';


@Component({
  selector: 'company-demo-project-editor-page',
  templateUrl: './company-demo-project-editor.component.html',
  styleUrls: ['./company-demo-project-editor.component.scss']
})
export class CompanyDemoProjectEditorComponent implements OnInit, ComponentCanDeactivate {

  minDate: string;
  maxDate: string;

  demoProject: DemoProject = {
    name: '',
    coverUrl: '',
    date: '',
    description: '',
    price: '',
    location: {
      state: '',
      city: '',
      streetAddress: '',
      zip: ''
    },
    serviceTypes: [],
    images: [],
  };

  projectImages: any[] = [];

  allServiceTypes: ServiceType[];
  newMode: boolean = false;
  filteredStates = [];
  selectedControl = new FormControl();
  filteredServiceTypes: Observable<ServiceType[]>;
  userId: string;
  companyId: string;
  projectId: string;
  formHasChanges: boolean = false;
  savingData: boolean = false;

  @ViewChild(ImagesUploaderComponent) imageUploader: ImagesUploaderComponent;
  @ViewChild('demoProjectForm') demoProjectForm: NgForm;

  constructor(public route: ActivatedRoute,
              public popUpMessageService: PopUpMessageService,
              private trickService: TricksService,
              private serviceTypeService: ServiceTypeService,
              private demoProjectService: DemoProjectService,
              public securityService: SecurityService,
              public router: Router,
              public constants: Constants,
              public messages: TextMessages) {
    this.userId = this.securityService.getLoginModel().id;
    this.minDate = format(addYears(new Date(), -20), 'YYYY-MM-DD');
    this.maxDate = format(addDays(new Date(), 1), 'YYYY-MM-DD');

    this.route.params.subscribe(params => {

      this.companyId = params['companyId'];
      this.projectId = params['projectId'];
      this.newMode = params['mode'] != 'edit';

      let requests: any[] = [
        this.serviceTypeService.serviceTypes$
      ];

      if (!this.newMode) {
        requests.push(this.demoProjectService.get(this.companyId, this.projectId));
        requests.push(this.demoProjectService.getImages(this.companyId, this.projectId));
      }

      combineLatest(requests).subscribe(result => {
          this.allServiceTypes = result[0] as ServiceType[];
          this.demoProject = result[1] ? result[1] as DemoProject : this.demoProject;
          this.projectImages = result[2] ? result[2] as any[] : this.projectImages;
        },
        err => {
          console.error(err);
          if (err.status == 404 && !this.newMode) {
            this.router.navigate(['404']);
          } else {
            this.popUpMessageService.showError(getErrorMessage(err));
          }
        });

    });
  }

  ngOnInit() {
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification(event): any {
    if (!this.canDeactivate()) {

      return false;
    }
  }

  canDeactivate(): boolean {
    const haveUnsavedImages: boolean = this.imageUploader && this.imageUploader.hasUnsavedImages();
    return !(haveUnsavedImages || this.formHasChanges);
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

  getServiceTypes() {
    this.serviceTypeService.serviceTypes$
      .subscribe(
        serviceTypes => {
          this.allServiceTypes = serviceTypes;
          this.filteredServiceTypes = this.selectedControl.valueChanges.pipe(
            startWith(null),
            map(serviceType => serviceType && typeof serviceType === 'object' ? serviceType.name : serviceType),
            map(name => name ? this.filter(name, this.allServiceTypes) : this.allServiceTypes ? this.allServiceTypes.slice() : []),
          );

        },
        err => {
          console.error(err);
        });
  }

  saveDemoProject(form: NgForm, formChanges: FormHasChangesDirective): void {
    formChanges.markAsNotChanged();
    this.savingData = true;

    let request = this.newMode
      ? this.demoProjectService.post(this.companyId, this.demoProject)
      : this.demoProjectService.update(this.companyId, this.demoProject.id, this.demoProject);

    request.pipe(finalize(() => this.savingData = false))
      .subscribe(demoProject => {
          this.demoProject = demoProject;
          if (this.imageUploader.hasUnsavedImages()) {
            this.imageUploader.uploadAllImages(`/api/companies/${this.companyId}/demo-projects/${this.demoProject.id}/images`);
            this.imageUploader.uploadCompleted.pipe(first())
              .subscribe(() => {
                this.projectSaved()
              })
          } else {
            this.projectSaved()
          }
        },
        err => this.popUpMessageService.showError(getErrorMessage(err)));
  }

  projectSaved() {
    this.formHasChanges = false;
    this.popUpMessageService.showSuccess('Project is updated');
    this.router.navigate(['companies', this.companyId, 'projects', 'view', this.demoProject.id]);
  }

  deleteDemoProject(id) {
    this.demoProjectService.delete(this.companyId, id)
      .subscribe(
        response => {
          this.router.navigate(['/companies', this.companyId]);
        },
        err => {
          console.error(err);
          this.popUpMessageService.showError(getErrorMessage(err));
        });
  }

  trackBy(index, item): boolean {
    return item.name;
  }

}
