import {
  AfterViewInit,
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
import { ProjectActionService } from '../../api/services/project-action.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Constants } from '../../util/constants';
import { ServiceTypeService } from '../../api/services/service-type.service';
import { Router } from '@angular/router';
import { SecurityService } from "../../auth/security.service";
import { UserService } from "../../api/services/user.service";
import { CustomerSuggestionService } from "../../api/services/customer-suggestion.service";
import { Role } from "../../model/security-model";
import { TradeService } from "../../api/services/trade.service";
import { UserSearchService } from "../../util/user-search.service";
import { dialogsMap } from "../dialogs/dialogs.state";
import { MediaQuery, MediaQueryService } from "../../api/services/media-query.service";
import { takeUntil } from "rxjs/operators";
import { Subject } from "rxjs";
import { mobileMainDialogBarConfig } from "../dialogs/dialogs.configs";
import { MobileMenuService } from "../../api/services/mobile-menu-service";

@Component({
  selector: 'main-search-bar',
  templateUrl: './main-search-bar.component.html',
  styleUrls: ['./main-search-bar.component.scss']
})
export class MainSearchBarComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() selected: string;
  @Input() zipCode: number;
  @Input() resetAfterFind: boolean = true;
  @Input() mainButtonText: string = 'SEARCH';
  @Output() notMatch: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild("selectionInput") selectionInputRef: ElementRef;

  mainSearchFormGroup: FormGroup;
  selectionCtrl: FormControl;
  zipCodeCtrl: FormControl;
  filteredOptions: Array<any> = [];
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
              public mobileMenuService: MobileMenuService,
              private serviceTypeService: ServiceTypeService,
              private tradeService: TradeService,
              private router: Router,
              private securityService: SecurityService,
              private mediaQueryService: MediaQueryService,
              private changeDetectorRef: ChangeDetectorRef) {

    this.mediaQueryService.screen.pipe(takeUntil(this.destroyed$)).subscribe((mediaQuery: MediaQuery) => {
      this.media = mediaQuery;
      this.changeDetectorRef.markForCheck();
    });

    this.getPopularServiceTypes();
  }

  ngAfterViewInit(): void {
	}

	ngOnInit(): void {
    let group: any = {};
    group.selectionCtrl = new FormControl(this.selected, Validators.required);
    group.zipCodeCtrl = new FormControl(this.zipCode, Validators.compose([Validators.required, Validators.pattern(this.constants.patterns.zipcode)]));
    this.mainSearchFormGroup = new FormGroup(group);
    this.selectionCtrl = group.selectionCtrl;
    this.zipCodeCtrl = group.zipCodeCtrl;

    this.customerSuggestionService.onZipChange.subscribe(zip=> this.zipCodeCtrl.setValue(zip));

    this.zipCodeCtrl.setValue(localStorage.getItem('zipCode'));

    this.securityService.onUserInit.subscribe(() => {
      if (this.securityService.hasRole(Role.CUSTOMER)) {
        this.getLastCustomerZipCode();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.selected && !changes.selected.firstChange) {
      this.selectionCtrl.setValue(changes.selected.currentValue);
    }
    if (changes.zipCode && !changes.zipCode.firstChange){
      this.zipCodeCtrl.setValue(changes.zipCode.currentValue);
    }
  }

  autocompleteSearch(search): void {
    setTimeout(() => {
      this.filteredOptions = this.userSearchService.autocompleteSearchResult(search);
    },);
  }

  openMobileSearchBar(){
    this.selectionInputRef.nativeElement.blur();
    this.dialog.closeAll();
    this.mobileMenuService.findProfessionalsOpened = true;
    this.mobileSearchDialogRef = this.dialog.open(dialogsMap['mobile-main-search-bar'], mobileMainDialogBarConfig );
    this.mobileSearchDialogRef.afterClosed()
        .subscribe(result => {
          this.mobileMenuService.findProfessionalsOpened = false;
          this.mobileSearchDialogRef = null;
        });
  }

  search(serviceType?: string): void {
    if (serviceType) {
      this.selectionCtrl.setValue(serviceType);
    }

    if (this.mainSearchFormGroup.valid) {
      this.userSearchService.isMobileSearchActive = false;
      const selectionCtrl = this.mainSearchFormGroup.get('selectionCtrl');
      if (selectionCtrl.value) {
        this.userSearchService.findServiceTypeOrTrade(this.mainSearchFormGroup.value);
        if (this.resetAfterFind) {
          this.mainSearchFormGroup.reset({
            zipCodeCtrl: localStorage.getItem('zipCode') ? localStorage.getItem('zipCode') : this.lastZipCode
          });
        }
      }
    } else {
      markAsTouched(this.mainSearchFormGroup);
    }
  }

  getPopularServiceTypes() {
    this.customerSuggestionService.popularServices$
        .subscribe( (popularServiceTypes: Array<ServiceType>) => this.popularServiceTypes = this.filteredOptions = popularServiceTypes);
  }

  getLastCustomerZipCode() {
    this.customerSuggestionService.lastCustomerZipCode$
        .subscribe(lastZipCode => {
            this.lastZipCode = lastZipCode;
            this.zipCodeCtrl.setValue(lastZipCode)
          }
        );
  }

  selectTrackBy(index, item): number {
    return item.id;
  }

  mouseleave(event): void {
    Object.values(this.mainSearchFormGroup.controls).forEach(control => {
      if (!control.value) {
        control.reset();
        control.markAsPristine();
      }
    });
  }
}
