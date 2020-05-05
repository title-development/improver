import { AfterViewInit, Component, OnInit } from "@angular/core";
import { ServiceType, Trade } from "../../../model/data-model";
import { ServiceTypeService } from "../../../api/services/service-type.service";
import { TradeService } from "../../../api/services/trade.service";
import { ProjectActionService } from "../../../util/project-action.service";
import { Subject, Subscription } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import { PopUpMessageService } from "../../../util/pop-up-message.service";
import { getErrorMessage } from "../../../util/functions";
import { takeUntil } from "rxjs/operators";
import { MediaQuery, MediaQueryService } from "../../../util/media-query.service";

@Component({
  selector: 'category-services-page',
  templateUrl: './category-services.component.html',
  styleUrls: ['./category-services.component.scss']
})
export class CategoryServicesComponent implements OnInit, AfterViewInit {

  searchResultMessageText: string = '';
  private readonly destroyed$ = new Subject<void>();
  trade: Trade;
  filteredServices: ServiceType[] = [];
  private routeParamsSubscription: Subscription;
  categoryId: any;
  mediaQuery: MediaQuery;
  model: string = '';

  swiper: Swiper;

  //TODO add an image from trade
  tradeImages = [
    {image: 'assets/img/customer-banner-1.png'},
    {image: 'assets/img/customer-banner-2.png'},
    {image: 'assets/img/customer-banner-3.png'},
    {image: 'assets/img/customer-banner-3.png'},
  ];

  constructor(private serviceTypesService: ServiceTypeService,
              private tradeService: TradeService,
              private popUpService: PopUpMessageService,
              private router: Router,
              public route: ActivatedRoute,
              public projectActionService: ProjectActionService,
              public mediaQueryService: MediaQueryService) {

    this.routeParamsSubscription = this.route.params.subscribe(params => {
      params['categoryId'] ? this.categoryId = params['categoryId'].toString() : this.categoryId = '';
      this.getTrade(this.categoryId);
    });

    this.mediaQueryService.screen
        .pipe(takeUntil(this.destroyed$))
        .subscribe((mediaQuery: MediaQuery) => {
          this.mediaQuery = mediaQuery;
        });

  }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    this.swiper = new Swiper('.swiper-container', {
      pagination: '.swiper-pagination',
      paginationClickable: true,
      autoplay: 5000,
      spaceBetween: 0,
      speed: 300,
      loop: true,
    });
  }

  getTrade(tradeId) {
    this.tradeService.getTradeById(tradeId).subscribe(
      trade => {
        this.trade = trade;
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

    if (searchTerm == '') {
      this.filteredServices = this.trade.services;
      return;
    } else {

      this.filteredServices = [];

        for (let service of this.trade.services) {
          let regex = new RegExp(searchTerm, 'gi');
          if (regex.test(service.name)) {
            this.filteredServices.push(service)
          }
        }

      if (this.filteredServices.length == 0){
        this.searchResultMessageText = 'No results were found for \"' + searchTerm + '\".';
      } else {
        this.searchResultMessageText = '';
      }

    }

  }

  trackByFn(index: number, item: any): any {
    return item;
  }

}
