import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild
} from '@angular/core';
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ServiceType } from "../../model/data-model";
import { Constants } from "../../util/constants";
import { CustomerSuggestionService } from "../../api/services/customer-suggestion.service";
import { SecurityService } from "../../auth/security.service";
import { Role } from "../../model/security-model";
import { UserSearchService } from "../../util/user-search.service";
import { markAsTouched } from "../../util/functions";
import { CvSelectComponent } from "../../theme/select/cv-select/cv-select";
import { NavigationStart, Router } from "@angular/router";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

@Component({
  selector: 'mobile-main-search-bar',
  templateUrl: './mobile-main-search-bar.component.html',
  styleUrls: ['./mobile-main-search-bar.component.scss']
})
export class MobileMainSearchBarComponent implements OnInit, AfterViewInit, OnDestroy {

  resetAfterFind: boolean = false;
  mainSearchFormGroup: FormGroup;
  selectionCtrl: FormControl;
  zipCodeCtrl: FormControl;
  filteredServiceTypes: Array<ServiceType> = [];
  popularServiceTypes: Array<ServiceType> = [];
  searchResults: Array<ServiceType> = [];
  dropdownHeight: number = 5;
  lastZipCode: string;
  hasSearchResults: boolean = false;
	private readonly destroyed$ = new Subject<void>();

  @ViewChild('serviceType') cvSelectComponent: CvSelectComponent;

  constructor(public currentDialogRef: MatDialogRef<any>,
              public constants: Constants,
              public customerSuggestionService: CustomerSuggestionService,
              public userSearchService: UserSearchService,
              private securityService: SecurityService,
              private router: Router,
              private dialog: MatDialog,
              public element: ElementRef<HTMLElement>,
              private renderer: Renderer2,
              private changeDetectorRef: ChangeDetectorRef) {
    this.getPopularServiceTypes();
    this.getRouterEvents();
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
				if (this.securityService.hasRole(Role.CUSTOMER)) {
					this.getLastCustomerZipCode();
				}
			}
		);
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      let element =  this.element.nativeElement.querySelector('cv-select').getElementsByTagName('input')[0];
      this.changeDetectorRef.detectChanges();
    }, 0);
  }

  getRouterEvents(){
  	this.router.events.pipe(takeUntil(this.destroyed$)).subscribe( event => {
      if(event instanceof NavigationStart) {
        this.dialog.closeAll();
      }
    });
  }

  autocompleteSearch(search): void {
    this.filteredServiceTypes = this.userSearchService.autocompleteSearchResult(search);
  }

  searchServiceType(serviceType?: string): void {
    if (serviceType) {
      this.selectionCtrl.setValue(serviceType);
    }

    if (this.selectionCtrl.valid) {
      this.cvSelectComponent.startClosingDropdown();
      this.changeDetectorRef.detectChanges();
      this.userSearchService.isMobileSearchActive = true;
      const selectionCtrl = this.mainSearchFormGroup.get('selectionCtrl');
      if (selectionCtrl.value) {
        this.userSearchService.findServiceTypeOrTrade(this.mainSearchFormGroup.value);
        this.searchResults = this.userSearchService.getSearchResults(selectionCtrl.value.trim());
        if (this.filteredServiceTypes.length == 0) {
          this.hasSearchResults = false;
          this.searchResults = this.popularServiceTypes;
        } else {
          this.hasSearchResults = true;
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
    this.customerSuggestionService.popularServices$
      .subscribe( (popularServiceTypes: Array<ServiceType>) => this.popularServiceTypes = this.filteredServiceTypes = this.searchResults = popularServiceTypes);
  }

	getLastCustomerZipCode() {
		this.customerSuggestionService.lastCustomerZipCode$
				.subscribe(lastZipCode => {
						this.lastZipCode = lastZipCode;
						this.zipCodeCtrl.setValue(lastZipCode)
					});
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

  ngOnDestroy(): void {
		this.destroyed$.next();
		this.destroyed$.complete();
  }

}
