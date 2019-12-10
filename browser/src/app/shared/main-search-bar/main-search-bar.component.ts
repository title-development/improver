import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { getErrorMessage, markAsTouched } from '../../util/functions';
import { ServiceType, Trade } from '../../model/data-model';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ProjectActionService } from '../../util/project-action.service';
import { MatDialog } from '@angular/material';
import { Constants } from '../../util/constants';
import { ServiceTypeService } from '../../api/services/service-type.service';
import { Router } from '@angular/router';
import { PopUpMessageService } from "../../util/pop-up-message.service";
import { SecurityService } from "../../auth/security.service";
import { UserService } from "../../api/services/user.service";
import { CustomerSuggestionService } from "../../api/services/customer-suggestion.service";
import { Role } from "../../model/security-model";
import { TradeService } from "../../api/services/trade.service";
import { UserSearchService } from "../../api/services/user-search.service";

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


  constructor(public dialog: MatDialog,
              public projectActionService: ProjectActionService,
              public constants: Constants,
              public userService: UserService,
              public customerSuggestionService: CustomerSuggestionService,
              public userSearchService: UserSearchService,
              private serviceTypeService: ServiceTypeService,
              private tradeService: TradeService,
              private router: Router,
              private securityService: SecurityService,
              private popUpService: PopUpMessageService) {

    this.getPopularServiceTypes();
  }

  ngOnInit(): void {
    let group: any = {};
    group.serviceTypeCtrl = new FormControl(this.service, Validators.required);
    group.zipCodeCtrl = new FormControl(this.zipCode, Validators.compose([Validators.required, Validators.pattern(this.constants.patterns.zipcode)]));
    this.mainSearchFormGroup = new FormGroup(group);
    this.serviceTypeCtrl = group.serviceTypeCtrl;
    this.zipCodeCtrl = group.zipCodeCtrl;

    this.customerSuggestionService.onZipChange.subscribe(zip=> this.zipCodeCtrl.setValue(zip));

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
      if (search && search.length > 1) {
        this.filteredServiceTypes = this.userSearchService.getSearchResults(search.trim());
      } else {
        this.filteredServiceTypes = this.popularServiceTypes;
      }
      if (this.filteredServiceTypes.length == 0){
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

  searchServiceType(form: FormGroup): void {
    if (this.mainSearchFormGroup.valid) {
      const serviceTypeCtrl = this.mainSearchFormGroup.get('serviceTypeCtrl');
      if (serviceTypeCtrl.value) {
        this.userSearchService.findServiceType(this.mainSearchFormGroup.value);
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

  getPopularServiceTypes() {
    this.customerSuggestionService.popular$
      .subscribe(
        popularServiceTypes => this.popularServiceTypes = this.filteredServiceTypes = popularServiceTypes
      );
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
