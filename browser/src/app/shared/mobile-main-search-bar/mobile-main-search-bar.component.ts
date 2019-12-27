import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges, ViewChild
} from '@angular/core';
import { MatDialogRef } from "@angular/material/dialog";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ServiceType } from "../../model/data-model";
import { Constants } from "../../util/constants";
import { CustomerSuggestionService } from "../../api/services/customer-suggestion.service";
import { SecurityService } from "../../auth/security.service";
import { Role } from "../../model/security-model";
import { UserSearchService } from "../../api/services/user-search.service";
import { markAsTouched } from "../../util/functions";

@Component({
  selector: 'mobile-main-search-bar',
  templateUrl: './mobile-main-search-bar.component.html',
  styleUrls: ['./mobile-main-search-bar.component.scss']
})
export class MobileMainSearchBarComponent implements OnInit, OnChanges, AfterViewInit {

  @Input() resetAfterFind: boolean = true;

  @ViewChild("serviceType") serviceTypeField: ElementRef;
  @ViewChild("zipCode") zipCodeField: ElementRef;

  mainSearchFormGroup: FormGroup;
  serviceTypeCtrl: FormControl;
  zipCodeCtrl: FormControl;
  filteredServiceTypes: Array<ServiceType> = [];
  popularServiceTypes: Array<ServiceType> = [];
  lastZipCode: string;

  constructor(public currentDialogRef: MatDialogRef<any>,
              public constants: Constants,
              public customerSuggestionService: CustomerSuggestionService,
              public userSearchService: UserSearchService,
              private securityService: SecurityService,
              public element: ElementRef<HTMLElement>) {
    this.getPopularServiceTypes();
  }

  ngOnInit() {
    let group: any = {};
    group.serviceTypeCtrl = new FormControl('', Validators.required);
    group.zipCodeCtrl = new FormControl('', Validators.compose([Validators.required, Validators.pattern(this.constants.patterns.zipcode)]));
    this.mainSearchFormGroup = new FormGroup(group);
    this.serviceTypeCtrl = group.serviceTypeCtrl;
    this.zipCodeCtrl = group.zipCodeCtrl;

    this.customerSuggestionService.onZipChange.subscribe(zip=> this.zipCodeCtrl.setValue(zip));

    this.zipCodeCtrl.setValue(localStorage.getItem('zipCode'));

    this.securityService.onUserInit.subscribe(() => {
        this.getLastCustomerZipCode();
      }
    );

    this.serviceTypeCtrl.valueChanges.subscribe( value => {
      this.autocompleteSearch(value);
    });
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

  searchServiceType(serviceType?: string): void {
    this.userSearchService.isMobileSearchActive = true;
    if (serviceType){
      this.serviceTypeCtrl.setValue(serviceType);
    }

    if (this.mainSearchFormGroup.valid) {
      const serviceTypeCtrl = this.mainSearchFormGroup.get('serviceTypeCtrl');
      if (serviceTypeCtrl.value) {
        this.userSearchService.findServiceType(this.mainSearchFormGroup.value);
        if (this.resetAfterFind) {
          this.mainSearchFormGroup.reset({
            zipCodeCtrl: localStorage.getItem('zipCode')? localStorage.getItem('zipCode'): this.lastZipCode
          });
          Object.values(this.mainSearchFormGroup.controls).forEach(control => control.markAsPristine());
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

  canDeactivate(): boolean {
    return false;
  }

  close() {
    this.currentDialogRef.close();
  }

  mouseleave(event: KeyboardEvent): void {
    Object.values(this.mainSearchFormGroup.controls).forEach(control => {
      if (!control.value) {
        control.reset();
        control.markAsPristine();
      }
    });
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification(event): any {
    if (!this.canDeactivate()) {
      return false;
    }
  }

  ngAfterViewInit(): void {
    if (this.zipCodeCtrl.valid){
      this.serviceTypeField.nativeElement.focus();
    } else {
      this.zipCodeField.nativeElement.focus();
    }
  }

}
