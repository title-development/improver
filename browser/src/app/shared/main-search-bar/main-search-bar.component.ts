import { Component, EventEmitter, HostListener, Input, OnChanges, OnInit, Output } from '@angular/core';
import { markAsTouched } from '../../util/functions';
import { ServiceType } from '../../model/data-model';
import { FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { ProjectActionService } from '../../util/project-action.service';
import { MatDialog } from '@angular/material';
import { Constants } from '../../util/constants';
import { ServiceTypeService } from '../../api/services/service-type.service';


import { Router } from '@angular/router';

@Component({
  selector: 'main-search-bar',
  templateUrl: './main-search-bar.component.html',
  styleUrls: ['./main-search-bar.component.scss']
})
export class MainSearchBarComponent implements OnInit, OnChanges {
  @Input() service: string;
  @Input() zipCode: number;
  @Input() resetAfterFind: boolean = true;
  @Output() notMatch: EventEmitter<any> = new EventEmitter<any>();

  mainSearchFormGroup: FormGroup;
  serviceTypeCtrl: FormControl;
  filteredServiceTypes: Array<ServiceType> = [];
  serviceTypes: Array<ServiceType> = [];

  constructor(public dialog: MatDialog,
              public projectActionService: ProjectActionService,
              public constants: Constants,
              private serviceTypeService: ServiceTypeService,
              private router: Router) {
    this.getServiceTypes();
  }

  ngOnInit(): void {
    let group: any = {};
    group.serviceTypeCtrl = new FormControl(this.service, Validators.required);
    group.zipCodeCtrl = new FormControl(this.zipCode, Validators.compose([Validators.required, Validators.pattern(this.constants.patterns.zipcode)]));
    this.mainSearchFormGroup = new FormGroup(group);
    this.serviceTypeCtrl = group.serviceTypeCtrl;
  }

  ngOnChanges(changes): void {
  }


  autocompleteSearch(search): void {
    if (search) {
      this.filteredServiceTypes = this.serviceTypes.filter(service => {
        const regExp: RegExp = new RegExp(`\\b${search}`, 'gmi');
        return regExp.test(service.name);
      });

    } else if (this.filteredServiceTypes.length > 0) {
      this.filteredServiceTypes = this.serviceTypes;
    }
  }

  searchServiceType(form: FormGroup): void {
    if (this.mainSearchFormGroup.valid) {
      const serviceTypeCtrl = this.mainSearchFormGroup.get('serviceTypeCtrl');
      if (serviceTypeCtrl.value) {
        this.getQuestianary(serviceTypeCtrl.value);
        if (this.resetAfterFind) {
          form.reset();
          Object.values(form.controls).forEach(control => control.markAsPristine());
        }
      }
    } else {
      markAsTouched(this.mainSearchFormGroup);
    }
  }


  getQuestianary(serviceType: ServiceType | string): void {
    const formData = this.mainSearchFormGroup.value;
    if (typeof serviceType != 'string') {
      this.find(serviceType, formData);
    } else {
      const filtered = this.serviceTypes.filter(item => item.name.toLowerCase() == serviceType.toLowerCase());
      if (filtered.length > 0) {
        this.find(filtered[0], formData);
      } else {
        this.find(serviceType, formData);
      }
    }
  }

  find(serviceType, formData): void {
    if (serviceType.id) {
      this.projectActionService.openQuestionary(serviceType, formData.zipCodeCtrl);
    } else {
      console.warn('Service type is not found. Redirecting to custom search.');
      this.router.navigate(['search'], {queryParams: {service: formData.serviceTypeCtrl, zip: formData.zipCodeCtrl}});
      this.notMatch.emit({service: serviceType, zip: formData.zipCodeCtrl});
    }
  }

  getServiceTypes(): void {
    this.serviceTypeService.serviceTypes$
      .subscribe(
        (serviceTypes: Array<ServiceType>) => {
          if (serviceTypes && serviceTypes.length > 0) {
            this.serviceTypes = this.filteredServiceTypes = serviceTypes;
            if (this.service && this.zipCode) {
              this.searchServiceType(this.mainSearchFormGroup);
            }
          }
        },
        err => {
          console.log(err);
        });
  }

  selectTrackBy(index: number, item: ServiceType): number {
    return item.id;
  }

  mouseleave(event: KeyboardEvent): void {
    Object.values(this.mainSearchFormGroup.controls).forEach(control => {
      if (!control.value) {
        control.reset();
        control.markAsPristine();
      }
    });
  }
}
