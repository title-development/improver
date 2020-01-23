import { Component, ElementRef, HostListener, Input, OnInit } from '@angular/core';
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
export class MobileMainSearchBarComponent implements OnInit {

  resetAfterFind: boolean = false;
  searchResultMessageText: string;
  mainSearchFormGroup: FormGroup;
  serviceTypeCtrl: FormControl;
  zipCodeCtrl: FormControl;
  filteredServiceTypes: Array<ServiceType> = [];
  popularServiceTypes: Array<ServiceType> = [];
  searchResults: Array<ServiceType> = [];
  dropdownHeight: number = 5;
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

    this.customerSuggestionService.onZipChange.subscribe(zip => this.zipCodeCtrl.setValue(zip));

    this.zipCodeCtrl.setValue(localStorage.getItem('zipCode'));

    this.securityService.onUserInit.subscribe(() => {
        this.getLastCustomerZipCode();
      }
    );
  }

  // TODO: Ivan, refactor this
  autocompleteSearch(search): void {
    setTimeout(() => {
      if (search && search.length > 1) {
        this.filteredServiceTypes = this.userSearchService.getSearchResults(search.trim());
      } else {
        this.filteredServiceTypes = this.popularServiceTypes;
      }
    }, 0);
  }

  searchServiceType(serviceType?: string): void {
    if (serviceType) {
      this.serviceTypeCtrl.setValue(serviceType);
    }

    if (this.mainSearchFormGroup.valid) {
      this.userSearchService.isMobileSearchActive = true;
      const serviceTypeCtrl = this.mainSearchFormGroup.get('serviceTypeCtrl');
      if (serviceTypeCtrl.value) {
        this.userSearchService.findServiceType(this.mainSearchFormGroup.value);
        this.searchResults = this.userSearchService.getSearchResults(serviceTypeCtrl.value.trim());
        if (this.searchResults.length == 0) {
          this.searchResultMessageText = 'No results were found for \"' + serviceTypeCtrl.value + '\". The following are results for a similar search.';
          this.searchResults = this.popularServiceTypes;
        } else {
          this.searchResultMessageText = '';
        }
        if (this.resetAfterFind) {
          this.mainSearchFormGroup.reset({
            zipCodeCtrl: localStorage.getItem('zipCode') ? localStorage.getItem('zipCode') : this.lastZipCode
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

  focusout() {
    if (this.zipCodeCtrl.valid){
      this.searchServiceType();
    }
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification(event): any {
    if (!this.canDeactivate()) {
      return false;
    }
  }

  selectTrackBy(index: number, item: ServiceType): number {
    return item.id;
  }

}
