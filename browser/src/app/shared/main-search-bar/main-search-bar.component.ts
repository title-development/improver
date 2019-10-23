import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { getErrorMessage, markAsTouched } from '../../util/functions';
import { ServiceType } from '../../model/data-model';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ProjectActionService } from '../../util/project-action.service';
import { MatDialog } from '@angular/material';
import { Constants } from '../../util/constants';
import { ServiceTypeService } from '../../api/services/service-type.service';
import { Router } from '@angular/router';
import * as lunr from "lunr";
import { combineLatest } from "rxjs";
import { PopUpMessageService } from "../../util/pop-up-message.service";
import { SecurityService } from "../../auth/security.service";
import { UserService } from "../../api/services/user.service";
import { CustomerSuggestionService } from "../../api/services/customer-suggestion.service";
import { Role } from "../../model/security-model";

@Component({
  selector: 'main-search-bar',
  templateUrl: './main-search-bar.component.html',
  styleUrls: ['./main-search-bar.component.scss']
})
export class MainSearchBarComponent implements OnInit, OnChanges {
  @Input() service: string;
  @Input() zipCode: number;
  @Input() resetAfterFind: boolean = true;
  @Input() mainButtonText: string = 'GET STARTED';
  @Output() notMatch: EventEmitter<any> = new EventEmitter<any>();

  mainSearchFormGroup: FormGroup;
  serviceTypeCtrl: FormControl;
  zipCodeCtrl: FormControl;
  filteredServiceTypes: Array<ServiceType> = [];
  serviceTypes: Array<ServiceType> = [];
  popularServiceTypes: Array<ServiceType> = [];
  lastZipCode: string;
  private lunrIndex;


  constructor(public dialog: MatDialog,
              public projectActionService: ProjectActionService,
              public constants: Constants,
              public userService: UserService,
              public customerSuggestionService: CustomerSuggestionService,
              private serviceTypeService: ServiceTypeService,
              private router: Router,
              private securityService: SecurityService,
              private popUpService: PopUpMessageService) {
    this.getServiceTypes();
  }

  ngOnInit(): void {
    let group: any = {};
    group.serviceTypeCtrl = new FormControl(this.service, Validators.required);
    group.zipCodeCtrl = new FormControl(this.zipCode, Validators.compose([Validators.required, Validators.pattern(this.constants.patterns.zipcode)]));
    this.mainSearchFormGroup = new FormGroup(group);
    this.serviceTypeCtrl = group.serviceTypeCtrl;
    this.zipCodeCtrl = group.zipCodeCtrl;

    this.zipCodeCtrl.setValue(localStorage.getItem('zipCode'));

    this.securityService.onUserInit.subscribe(() => {
        this.getLastCustomerZipCode();
      }
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.service && !changes.service.firstChange) {
      this.serviceTypeCtrl.setValue(changes.service.currentValue);
    }
    if (changes.zipCode && !changes.zipCode.firstChange){
      this.zipCodeCtrl.setValue(changes.zipCode.currentValue);
    }
  }

  autocompleteSearch(search): void {
    setTimeout(() => {
      if (search) {
        this.deepSearch(search.trim());
      } else if (this.filteredServiceTypes.length > 0) {
        this.filteredServiceTypes = this.popularServiceTypes;
      }
    }, 0);
  }

  searchByRegex(search: string) {
    this.filteredServiceTypes = this.serviceTypes.filter(service => {
      const regExp: RegExp = new RegExp(`\\b${search}`, 'gmi');
      return regExp.test(service.name);
    });
  }

  deepSearch(search: string) {
    if(this.lunrIndex) {
      this.filteredServiceTypes = this.lunrIndex.search(`${search}*`)
        .map(item => this.serviceTypes.find(service => item.ref == service.id));
    }
  }

  searchServiceType(form: FormGroup): void {
    if (this.mainSearchFormGroup.valid) {
      const serviceTypeCtrl = this.mainSearchFormGroup.get('serviceTypeCtrl');
      if (serviceTypeCtrl.value) {
        this.getQuestianary(serviceTypeCtrl.value);
        if (this.resetAfterFind) {
          form.reset({
            zipCodeCtrl: localStorage.getItem('zipCode')? localStorage.getItem('zipCode'): this.lastZipCode
          });
          Object.values(form.controls).forEach(control => control.markAsPristine());
        }
      }
    } else {
      markAsTouched(this.mainSearchFormGroup);
    }
  }


  getQuestianary(serviceType: string): void {
    const formData = this.mainSearchFormGroup.value;
    let searchString: string;
    const filtered = this.serviceTypes.filter(item => item.name.toLowerCase() == serviceType.toLowerCase());
    if (filtered.length > 0) {
      this.find(filtered[0], formData);
      searchString = filtered[0].name;
    } else {
      this.find(serviceType, formData);
      searchString = serviceType;
    }
    this.customerSuggestionService.saveUserSearchTerm(searchString, this.zipCodeCtrl.value);
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
    let requests = combineLatest(this.serviceTypeService.serviceTypes$, this.customerSuggestionService.popular$);

    requests.subscribe(
        results => {
          let serviceTypes = results[0];
          let popularServiceTypes = results[1];
          if (serviceTypes && serviceTypes.length > 0) {
            this.lunrIndex = lunr(function () {
              this.ref('id');
              this.field('name');
              serviceTypes.forEach(service => this.add(service));
            });
            this.serviceTypes = serviceTypes;
            this.filteredServiceTypes = this.popularServiceTypes = popularServiceTypes;
            if (this.service && this.zipCode) {
              this.searchServiceType(this.mainSearchFormGroup);
            }
          }
        },
        err => this.popUpService.showError(getErrorMessage(err)));
  }

  getLastCustomerZipCode() {
    if (this.securityService.hasRole(Role.CUSTOMER) || this.securityService.hasRole(Role.ANONYMOUS)) {
      this.customerSuggestionService.lastCustomerZipCode$
        .subscribe(
          lastZipCode => {
            this.lastZipCode = lastZipCode;
            this.zipCodeCtrl.setValue(lastZipCode)
          }
        );
    }
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
