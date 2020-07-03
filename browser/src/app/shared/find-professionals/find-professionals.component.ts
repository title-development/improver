import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Pagination, ServiceType, NameIdImageTuple } from '../../model/data-model';
import { ServiceTypeService } from '../../api/services/service-type.service';
import { TradeService } from '../../api/services/trade.service';
import { Constants } from '../../util/constants';
import { QuestionaryControlService } from '../../util/questionary-control.service';
import { ProjectActionService } from '../../util/project-action.service';
import { MediaQueryService } from '../../util/media-query.service';
import { markAsTouched } from '../../util/functions';
import { Router } from '@angular/router';
import { FindProfessionalService } from '../../util/find-professional.service';
import { PopUpMessageService } from "../../util/pop-up-message.service";
import { SecurityService } from "../../auth/security.service";
import { UserService } from "../../api/services/user.service";
import { CustomerSuggestionService } from "../../api/services/customer-suggestion.service";
import { takeUntil } from "rxjs/operators";
import { Role } from "../../model/security-model";
import { UserSearchService } from "../../api/services/user-search.service";


@Component({
  selector: 'find-professionals',
  templateUrl: 'find-professionals.component.html',
  styleUrls: ['find-professionals.component.scss']
})

export class FindProfessionalsComponent implements OnInit {

  mainSearchFormGroup: FormGroup;
  selectionCtrl: FormControl;
  zipCodeCtrl: FormControl;
  suggestedServiceTypes: Array<ServiceType> = [];
  popularServiceTypes: Array<ServiceType> = [];
  filteredServiceTypes: Array<ServiceType> = [];
  popularServiceSize: Number;
  popularTrades: Array<NameIdImageTuple> = [];
  recentSearches: Array<string> = [];
  pagination: Pagination = new Pagination(0, 4);
  lastZipCode: string;
  showMoreActivated: boolean = false;
  mediaQuery: any;
  swiper: Swiper;


  constructor(private serviceTypeService: ServiceTypeService,
              private questionaryControlService: QuestionaryControlService,
              private tradeService: TradeService,
              private router: Router,
              private securityService: SecurityService,
              private popUpService: PopUpMessageService,
              public userSearchService: UserSearchService,
              public customerSuggestionService: CustomerSuggestionService,
              public dialog: MatDialog,
              public userService: UserService,
              public projectActionService: ProjectActionService,
              public constants: Constants,
              public media: MediaQueryService,
              private changeDetectorRef: ChangeDetectorRef,
              public findProfessionalService: FindProfessionalService) {
    let group: any = {};

    group.selectionCtrl = new FormControl(null, Validators.required);
    group.zipCodeCtrl = new FormControl(
      null,
      Validators.compose([Validators.required, Validators.pattern(constants.patterns.zipcode)])
    );

    this.mainSearchFormGroup = new FormGroup(group);
    this.selectionCtrl = group.selectionCtrl;
    this.zipCodeCtrl = group.zipCodeCtrl;

    this.getSuggestedTrades();
    this.getPopularServiceTypes();

    this.customerSuggestionService.onZipChange.subscribe(zip => this.zipCodeCtrl.setValue(zip));

    this.zipCodeCtrl.setValue(localStorage.getItem('zipCode'));

    securityService.onUserInit
      .pipe(takeUntil(securityService.onLogout))
      .subscribe(() => {
        if (this.securityService.hasRole(Role.CUSTOMER)) {
          this.getRecentSearches();
          this.getLastCustomerZipCode();
        }
      }
    );

    this.media.screen.subscribe(media => {
      this.mediaQuery = media;
      if (media.xs || media.sm) {
        this.popularServiceSize = 8;
      }
      if (media.md || media.lg || media.xlg) {
        this.popularServiceSize = 16;
      }
    });
  }

  ngOnInit() {
    this.findProfessionalService.visibilityState.subscribe( show => {
      if (show){
        setTimeout(()=> {
          this.swiper = new Swiper('.find-professional-swiper', {
            slidesPerView: 4,
            nextButton: '.next',
            prevButton: '.previous',
            spaceBetween: 30,
            speed: 300,
            loop: true,
            breakpoints: {
              1100: {
                slidesPerView: 3,
                spaceBetween: 25
              },
              820: {
                slidesPerView: 2,
                spaceBetween: 30
              }
            }
          });
        },);
      } else {
        this.showMoreActivated = false;
      }
    });
  }


  autocompleteSearch(search): void {
    this.filteredServiceTypes = this.userSearchService.autocompleteSearchResult(search);
  }

  getRecentSearches() {
    this.customerSuggestionService.getCustomerRecentSearches$()
        .subscribe((recentSearches: Array<string>) => this.recentSearches = recentSearches)
  }

  getPopularServiceTypes() {
    this.customerSuggestionService.popularServices$
      .subscribe((popularServiceTypes: Array<ServiceType>) => this.popularServiceTypes = this.filteredServiceTypes = popularServiceTypes);
  }

  getSuggestedTrades() {
		this.customerSuggestionService.popularTrades$
      .subscribe((popularTrades: Array<NameIdImageTuple>) => this.popularTrades = popularTrades);
  }

  getLastCustomerZipCode() {
    this.customerSuggestionService.lastCustomerZipCode$
        .subscribe(lastZipCode => {
              this.lastZipCode = lastZipCode;
              this.zipCodeCtrl.setValue(lastZipCode)
            }
        );
  }

  searchServiceTypeByRecentSearch(recentSearch: any){
    this.findProfessionalService.close();
    this.mainSearchFormGroup.setValue({
      selectionCtrl: recentSearch,
      zipCodeCtrl: this.lastZipCode
    });
    if (this.lastZipCode){
      this.searchServiceType(this.mainSearchFormGroup);
    } else {
      this.projectActionService.openQuestionaryWithLastZipCode(recentSearch);
    }
  }

  searchServiceType(form: FormGroup) {
    if (this.mainSearchFormGroup.valid) {
      this.userSearchService.isMobileSearchActive = false;
      this.findProfessionalService.close();
      this.userSearchService.findServiceTypeOrTrade(this.mainSearchFormGroup.value);
      form.reset({
        zipCodeCtrl: localStorage.getItem('zipCode')? localStorage.getItem('zipCode'): this.lastZipCode
      });
      Object.values(form.controls).forEach(control => control.markAsPristine());
    } else {
      markAsTouched(this.mainSearchFormGroup);
    }
  }


  selectTrackBy(index: number, item: ServiceType): number {
    return item.id;
  }

  showMore(){
    this.showMoreActivated = true;
  }

  mouseleave(event: Event): void {
    Object.values(this.mainSearchFormGroup.controls).forEach(control => {
      if (!control.value) {
        control.reset();
        control.markAsPristine();
      }
    });
  }

}
