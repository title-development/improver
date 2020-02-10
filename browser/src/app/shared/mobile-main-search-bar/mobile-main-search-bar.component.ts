import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnInit,
  Renderer2,
  ViewChild
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
import { CvSelectComponent } from "../../theme/select/cv-select/cv-select";

@Component({
  selector: 'mobile-main-search-bar',
  templateUrl: './mobile-main-search-bar.component.html',
  styleUrls: ['./mobile-main-search-bar.component.scss']
})
export class MobileMainSearchBarComponent implements OnInit, AfterViewInit {

  resetAfterFind: boolean = false;
  searchResultMessageText: string;
  mainSearchFormGroup: FormGroup;
  selectionCtrl: FormControl;
  zipCodeCtrl: FormControl;
  filteredServiceTypes: Array<ServiceType> = [];
  popularServiceTypes: Array<ServiceType> = [];
  searchResults: Array<ServiceType> = [];
  dropdownHeight: number = 5;
  lastZipCode: string;

  @ViewChild('serviceType') cvSelectComponent: CvSelectComponent;

  constructor(public currentDialogRef: MatDialogRef<any>,
              public constants: Constants,
              public customerSuggestionService: CustomerSuggestionService,
              public userSearchService: UserSearchService,
              private securityService: SecurityService,
              public element: ElementRef<HTMLElement>,
              private renderer: Renderer2,
              private changeDetectorRef: ChangeDetectorRef) {
    this.getPopularServiceTypes();
  }

  ngOnInit() {
    let group: any = {};
    group.selectionCtrl = new FormControl('', Validators.required);
    group.zipCodeCtrl = new FormControl('', Validators.compose([Validators.required, Validators.pattern(this.constants.patterns.zipcode)]));
    this.mainSearchFormGroup = new FormGroup(group);
    this.selectionCtrl = group.selectionCtrl;
    this.zipCodeCtrl = group.zipCodeCtrl;

    this.customerSuggestionService.onZipChange.subscribe(zip => this.zipCodeCtrl.setValue(zip));

    this.zipCodeCtrl.setValue(localStorage.getItem('zipCode'));

    this.securityService.onUserInit.subscribe(() => {
        this.getLastCustomerZipCode();
      }
    );
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      let element =  this.element.nativeElement.querySelector('cv-select').getElementsByTagName('input')[0];
      this.renderer.selectRootElement(element).focus();
      this.changeDetectorRef.detectChanges();
    }, 0);
  }

  autocompleteSearch(search): void {
    this.filteredServiceTypes = this.userSearchService.autocompleteSearchResult(search);
  }

  searchServiceType(serviceType?: string): void {
    if (serviceType) {
      this.selectionCtrl.setValue(serviceType);
    }

    if (this.mainSearchFormGroup.valid) {
      this.cvSelectComponent.startClosingDropdown();
      this.changeDetectorRef.detectChanges();
      this.userSearchService.isMobileSearchActive = true;
      const selectionCtrl = this.mainSearchFormGroup.get('selectionCtrl');
      if (selectionCtrl.value) {
        this.userSearchService.findServiceTypeOrTrade(this.mainSearchFormGroup.value);
        this.searchResults = this.userSearchService.getSearchResults(selectionCtrl.value.trim());
        if (this.searchResults.length == 0) {
          this.searchResultMessageText = 'No results were found for \"' + selectionCtrl.value + '\". The following are results for a similar search.';
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
