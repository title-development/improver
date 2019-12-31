import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { markAsTouched } from '../../util/functions';
import { ServiceType } from '../../model/data-model';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ProjectActionService } from '../../util/project-action.service';
import { MatDialog } from '@angular/material';
import { Constants } from '../../util/constants';
import { ServiceTypeService } from '../../api/services/service-type.service';
import { Router } from '@angular/router';
import { SecurityService } from "../../auth/security.service";
import { UserService } from "../../api/services/user.service";
import { CustomerSuggestionService } from "../../api/services/customer-suggestion.service";
import { Role } from "../../model/security-model";
import { TradeService } from "../../api/services/trade.service";
import { UserSearchService } from "../../api/services/user-search.service";
import { dialogsMap } from "../dialogs/dialogs.state";
import { MediaQuery, MediaQueryService } from "../../util/media-query.service";
import { takeUntil } from "rxjs/operators";
import { Subject } from "rxjs";
import { mobileMainDialogBarConfig } from "../dialogs/dialogs.configs";
import { MatDialogRef } from "@angular/material/dialog";

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
  @ViewChild("serviceType") serviceTypeRef: ElementRef;

  mainSearchFormGroup: FormGroup;
  serviceTypeCtrl: FormControl;
  zipCodeCtrl: FormControl;
  filteredServiceTypes: Array<ServiceType> = [];
  serviceTypes: Array<ServiceType> = [];
  popularServiceTypes: Array<ServiceType> = [];
  mobileSearchDialogRef: MatDialogRef<any>;
  lastZipCode: string;
  media: MediaQuery;
  private readonly destroyed$ = new Subject<void>();

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
              private mediaQueryService: MediaQueryService,
              private changeDetectorRef: ChangeDetectorRef) {

    this.mediaQueryService.screen.pipe(takeUntil(this.destroyed$)).subscribe((mediaQuery: MediaQuery) => {
      this.media = mediaQuery;

      if (this.media.xs || this.media.sm){
        this.mainButtonText = 'FIND';
      } else {
        this.mainButtonText = 'GET STARTED';
      }
      this.changeDetectorRef.markForCheck();
    });

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

  openMobileSearchBar(){
    this.serviceTypeRef.nativeElement.blur();
    this.dialog.closeAll();
    this.mobileSearchDialogRef = this.dialog.open(dialogsMap['mobile-main-search-bar'], mobileMainDialogBarConfig );
    this.mobileSearchDialogRef.afterClosed()
      .subscribe(result => {
        this.mobileSearchDialogRef = null;
      });
  }

  searchServiceType(form: FormGroup): void {
    if (this.mainSearchFormGroup.valid) {
      this.userSearchService.isMobileSearchActive = false;
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
