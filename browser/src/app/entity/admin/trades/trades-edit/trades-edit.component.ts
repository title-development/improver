import { ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TradeService } from '../../../../api/services/trade.service';
import { of, Subject } from 'rxjs';
import { ServiceTypeService } from '../../../../api/services/service-type.service';
import { ServiceType, SystemMessageType } from '../../../../model/data-model';
import { SelectItem } from 'primeng/api';
import { AdminTrade } from '../../../../api/models/AdminTrade';
import { first, switchMap } from "rxjs/internal/operators";
import { PopUpMessageService } from "../../../../util/pop-up-message.service";
import { Location } from '@angular/common';
import { getErrorMessage } from "../../../../util/functions";

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
  private readonly destroyed$ = new Subject<void>();

  constructor(private route: ActivatedRoute,
              private router: Router,
              private tradeService: TradeService,
              private serviceTypeService: ServiceTypeService,
              private popUpService: PopUpMessageService,
							public changeDetectorRef: ChangeDetectorRef,
              public location: Location) {
    this.route.params.pipe(
      first(),
      switchMap(params => {
        this.mode = params['mode'];
        if (params['id']) {
          return this.tradeService.getTradeById(params['id']);
        } else {
          return of(new AdminTrade('', '', [], 0, false, []));
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
        this.serviceTypes = [...this.trade.services, ...serviceTypes]
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

  addNewImage(image){
  	if (image.file){
			this.newImage = image.file;
			if (image.lastChange) {
				this.updateTradeImages(image.index);
			}
		}
  }

	updateTradeImages(index: number) {
      let data = new FormData();
      data.append('file', this.newImage);
      this.tradeService.updateTradeImages(this.trade.id, data, index.toString()).subscribe(response => {
        this.trade.imageUrls = response;
        this.newImage = null;
				this.changeDetectorRef.detectChanges();
      }, error => this.popUpService.showError(getErrorMessage(error)));
	}

	deleteImage(imageUrl: string) {
  	this.tradeService.deleteTradeImage(this.trade.id, imageUrl).subscribe(response => {
  		let index = this.trade.imageUrls.indexOf(imageUrl);
  		this.trade.imageUrls.splice(index, 1);
  		this.changeDetectorRef.detectChanges();
			this.popUpService.showMessage(
				{
					text: 'Image has been deleted.',
					type: SystemMessageType.INFO,
					timeout: 5000
				}
			);
			this.changeDetectorRef.detectChanges();
		}, error => this.popUpService.showError(getErrorMessage(error)));
	}

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
