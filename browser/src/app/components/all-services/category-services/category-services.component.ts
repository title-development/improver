import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { ServiceType } from "../../../model/data-model";
import { ServiceTypeService } from "../../../api/services/service-type.service";
import { TradeService } from "../../../api/services/trade.service";
import { ProjectActionService } from "../../../api/services/project-action.service";
import { Subject, Subscription } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import { PopUpMessageService } from "../../../api/services/pop-up-message.service";
import { clone, getErrorMessage } from "../../../util/functions";
import { takeUntil } from "rxjs/operators";
import { MediaQuery, MediaQueryService } from "../../../api/services/media-query.service";
import { AdminTrade } from "../../../api/models/AdminTrade";
import { SearchHolder } from "../../../util/search-holder";

@Component({
  selector: 'category-services-page',
  templateUrl: './category-services.component.html',
  styleUrls: ['./category-services.component.scss']
})
export class CategoryServicesComponent implements OnInit {

  searchResultMessageText: string = '';
  private readonly destroyed$ = new Subject<void>();
  trade: AdminTrade;
  filteredServices: ServiceType[] = [];
  private routeParamsSubscription: Subscription;
  tradeId: any;
  mediaQuery: MediaQuery;
  model: string = '';

  swiper: Swiper;
  searchHolder: SearchHolder<ServiceType>

  constructor(private serviceTypesService: ServiceTypeService,
              private tradeService: TradeService,
              private popUpService: PopUpMessageService,
              private router: Router,
              private changeDetectorRef: ChangeDetectorRef,
              public route: ActivatedRoute,
              public projectActionService: ProjectActionService,
              public mediaQueryService: MediaQueryService) {

    this.routeParamsSubscription = this.route.params.subscribe(params => {
      params['tradeId'] ? this.tradeId = params['tradeId'].toString() : this.tradeId = '';
      this.getTrade(this.tradeId);
    });

    this.mediaQueryService.screen
        .pipe(takeUntil(this.destroyed$))
        .subscribe((mediaQuery: MediaQuery) => {
          this.mediaQuery = mediaQuery;
        });

  }

  ngOnInit() {
  }

  swiperInitializer() {
    if (this.trade.imageUrls.length > 1) {
      this.swiper = new Swiper('.swiper-container', {
        pagination: '.swiper-pagination',
        paginationClickable: true,
        autoplay: 5000,
        spaceBetween: 0,
        speed: 300,
        loop: true,
      });
    }
  }


  getTrade(tradeId) {
    this.tradeService.getTradeById(tradeId).subscribe(
      trade => {
        this.trade = trade;
        this.searchHolder = new SearchHolder<ServiceType>(this.trade.services)
        this.changeDetectorRef.detectChanges();
        this.swiperInitializer();
        this.onFilter('');
      },
      err => {
        console.error(err);
        if (err.status == 404) {
          this.router.navigate(['/404']);
        } else {
          this.popUpService.showError(getErrorMessage(err))
        }
      });
  }

  onFilter(searchTerm) {
    searchTerm = searchTerm.trim();

    if(!searchTerm) {
      this.filteredServices = clone(this.trade.services);
      this.searchResultMessageText = '';
      return
    } else {
      setTimeout(() => {
        let searchResults = this.searchHolder.search(searchTerm);

        if (searchResults.length == 0){
          this.searchResultMessageText = `No results were found for "${searchTerm}".`;
          this.filteredServices = [];
          return;
        } else {
          this.searchResultMessageText = '';
        }

        let serviceTypeIds = searchResults.map(e => e.id);
        this.filteredServices = clone(this.trade.services).filter(e => serviceTypeIds.includes(e.id))

      })



      if (this.filteredServices.length == 0){
        this.searchResultMessageText = `No results were found for "${searchTerm}".`;
      } else {
        this.searchResultMessageText = '';
      }
    }

  }

  trackByFn(index: number, item: any): any {
    return item;
  }

}
