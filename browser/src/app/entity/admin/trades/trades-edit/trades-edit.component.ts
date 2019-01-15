import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TradeService } from '../../../../api/services/trade.service';
import { of } from 'rxjs';
import { ServiceTypeService } from '../../../../api/services/service-type.service';
import { ServiceType } from '../../../../model/data-model';
import { SelectItem } from 'primeng/api';
import { AdminTrade } from '../../../../api/models/AdminTrade';
import { first, switchMap } from "rxjs/internal/operators";
import { PopUpMessageService } from "../../../../util/pop-up-message.service";

@Component({
  selector: 'trade-edit',
  templateUrl: './trades-edit.component.html',
  styleUrls: ['./trades-edit.component.scss']
})
export class TradesEditComponent {
  pageTitle: string = '';
  trade: AdminTrade;
  serviceTypes: Array<SelectItem>;
  mode: 'new' | 'view' | 'edit';
  previousName: string;
  private newImage: File;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private tradeService: TradeService,
              private serviceTypeService: ServiceTypeService,
              private popUpService: PopUpMessageService) {
    this.route.params.pipe(
      first(),
      switchMap(params => {
        this.mode = params['mode'];
        if (params['id']) {
          return this.tradeService.getTradeById(params['id']);
        } else {

          return of(new AdminTrade('', '', '', 0, []));
        }
      }),
      switchMap((trade: AdminTrade) => {
        if (trade) {
          this.pageTitle = this.mode != 'new' ? `<b>${trade.name}</b>` : 'Add New Trade';
          this.trade = trade;
          this.previousName = trade.name;

          return this.serviceTypeService.serviceTypes$;
        } else {

          return of(null);
        }
      })
    ).subscribe((serviceTypes: Array<ServiceType>) => {
      if (serviceTypes && serviceTypes instanceof Array) {
        this.serviceTypes = [...this.trade.serviceTypes, ...serviceTypes]
          .filter((item, index, arr) => index === arr.findIndex((t) => (t.id === item.id))) //remove duplicates
          .map(item => {
          return {
            label: item.name,
            value: item
          };
        });
      }
    });
  }

  addUpdateTrade(): void {
    const formData: FormData = new FormData();
    if (this.newImage) {
      formData.append('file', this.newImage);
    }
    formData.append('data', JSON.stringify(this.trade));
    if (this.trade && this.trade.id) {
      this.tradeService.updateTradeById(this.trade.id, formData).subscribe(res => {
        this.popUpService.showSuccess(`Trade ${this.trade.name} has been updated`);
        this.getTrade(this.trade.id);
        this.previousName = this.trade.name;
        this.router.navigate(['admin', 'trades']);
      });
    } else {
      this.tradeService.createTrade(formData).subscribe(res => {
        this.popUpService.showSuccess(`Trade ${this.trade.name} has been added`);
        this.previousName = this.trade.name;
        this.router.navigate(['admin', 'trades']);
      });
    }
  }

  getTrade(id: number): void {
    this.tradeService.getTradeById(id).subscribe((trade: AdminTrade) => {
      if (trade) {
        this.pageTitle = trade.id ? `Edit Trade` : 'Add New Trade';
        this.trade = trade;
        this.previousName = trade.name;
      }
    });
  }

  addImage(event: File): void {
    if (!event) {
      this.trade.imageUrl = null;
    }
    this.newImage = event;
  }
}
