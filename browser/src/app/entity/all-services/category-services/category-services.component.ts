import { Component, OnInit } from "@angular/core";
import { ServiceType, Trade } from "../../../model/data-model";
import { ServiceTypeService } from "../../../api/services/service-type.service";
import { TradeService } from "../../../api/services/trade.service";
import { ProjectActionService } from "../../../util/project-action.service";
import { Subscription } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import { PopUpMessageService } from "../../../util/pop-up-message.service";
import { getErrorMessage } from "../../../util/functions";

@Component({
  selector: 'category-services-page',
  templateUrl: './category-services.component.html',
  styleUrls: ['./category-services.component.scss']
})
export class CategoryServicesComponent implements OnInit {

  trade: Trade;
  filteredServices: ServiceType[] = [];
  private routeParamsSubscription: Subscription;
  categoryId: any;

  constructor(private serviceTypesService: ServiceTypeService,
              private tradeService: TradeService,
              private popUpService: PopUpMessageService,
              private router: Router,
              public route: ActivatedRoute,
              public projectActionService: ProjectActionService) {

    this.routeParamsSubscription = this.route.params.subscribe(params => {
      params['categoryId'] ? this.categoryId = params['categoryId'].toString() : this.categoryId = '';
      this.getTrade(this.categoryId);
    });

  }

  ngOnInit() {
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

    }

  }

  trackByFn(index: number, item: any): any {
    return item;
  }

}
