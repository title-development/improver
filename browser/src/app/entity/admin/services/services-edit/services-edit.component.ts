import { Component } from '@angular/core';
import { SelectItem } from 'primeng/api';
import { AdminServiceType } from '../../../../api/models/AdminServiceType';
import { ServiceTypeService } from '../../../../api/services/service-type.service';
import { TradeService } from '../../../../api/services/trade.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { Trade } from '../../../../model/data-model';
import { first, switchMap } from 'rxjs/internal/operators';
import { PopUpMessageService } from "../../../../util/pop-up-message.service";

@Component({
  selector: 'services-edit',
  templateUrl: './services-edit.component.html',
  styleUrls: ['./services-edit.component.scss']
})
export class ServicesEditComponent {
  pageTitle: string = '';
  serviceType: AdminServiceType;
  trades: Array<SelectItem>;
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
        if (params['id'] && this.mode != 'new') {
          return this.serviceTypeService.getServiceTypeById(params['id']);
        } else {
          return of(new AdminServiceType('', '', '', true, 0, [], 999, 0, []));
        }
      }),
      switchMap((serviceType: AdminServiceType) => {
        if (serviceType) {
          this.pageTitle = this.mode != 'new' ? `<b>${serviceType.name}</b>` : 'Add New Service';
          serviceType.leadPrice /= 100;
          this.serviceType = serviceType;
          this.previousName = serviceType.name;

          return this.tradeService.getAllAsModel();
        } else {

          return of(null);
        }
      })
    ).subscribe((trades: Array<Trade>) => {
      if (trades && trades instanceof Array) {
        this.trades = [...this.serviceType.trades, ...trades]
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

  saveServiceType(): void {
    const formData: FormData = new FormData();
    this.serviceType.leadPrice = this.serviceType.leadPrice * 100;
    if (this.newImage) {
      formData.append('file', this.newImage);
    }
    formData.append('data', JSON.stringify(this.serviceType));
    if (this.serviceType && this.serviceType.id) {
      this.serviceTypeService.updateServiceTypeById(this.serviceType.id, formData).subscribe(res => {
        this.popUpService.showSuccess(`${this.serviceType.name} has been updated`);
        this.getServiceType(this.serviceType.id);
        this.previousName = this.serviceType.name;
        this.router.navigate(['admin', 'services']);
      },err => {
        this.serviceType.leadPrice = this.serviceType.leadPrice / 100;
      });
    } else {
      this.serviceTypeService.createServiceType(formData).subscribe(res => {
        this.popUpService.showSuccess(`${this.serviceType.name} has been added`);
        this.previousName = this.serviceType.name;
        this.router.navigate(['admin', 'services']);
      }, err => {
        this.serviceType.leadPrice = this.serviceType.leadPrice / 100;
      });
    }
  }

  getServiceType(id: number): void {
    this.serviceTypeService.getServiceTypeById(id).subscribe((serviceType: AdminServiceType) => {
      if (serviceType) {
        this.pageTitle = serviceType.id ? `Edit Service` : 'Add New Service';
        serviceType.leadPrice /= 100;
        this.serviceType = serviceType;
        this.previousName = serviceType.name;
      }
    });
  }

  addImage(event: File): void {
    if (!event) {
      this.serviceType.imageUrl = null;
    }
    this.newImage = event;
  }
}
