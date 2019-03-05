import { ApplicationRef, Component, EventEmitter, OnInit } from '@angular/core';
import { SecurityService } from '../../../../auth/security.service';
import { Constants } from '../../../../util/constants';
import { ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material';
import { TradeService } from '../../../../api/services/trade.service';
import { ServiceTypeService } from '../../../../api/services/service-type.service';
import { CompanyService } from '../../../../api/services/company.service';
import { PopUpMessageService } from '../../../../util/pop-up-message.service';
import { getErrorMessage } from '../../../../util/functions';

@Component({
  selector: 'trades-and-services',
  templateUrl: './trades-and-services.component.html',
  styleUrls: ['./trades-and-services.component.scss']
})

export class TradesAndServicesComponent implements OnInit {

  tradesAndServiceTypes;

  constructor(public constants: Constants,
              public route: ActivatedRoute,
              public securityService: SecurityService,
              private tradeService: TradeService,
              public dialog: MatDialog,
              private serviceTypeService: ServiceTypeService,
              private companyService: CompanyService,
              public  popUpMessageService: PopUpMessageService,
              private appRef: ApplicationRef) {
    this.getCompanyTradesAndServiceTypes();
  }

  ngOnInit() {

  }

  getCompanyTradesAndServiceTypes() {
    this.companyService.getCompanyTradesAndServiceTypes(this.securityService.getLoginModel().company)
      .subscribe(
        tradesAndServiceTypes => {
          this.tradesAndServiceTypes = tradesAndServiceTypes;
          this.tradesAndServiceTypes.trades.forEach(trade => trade.collapsed = false);
        },
        err => {
          console.log(err);
          this.popUpMessageService.showError(getErrorMessage(err));
        });
  }

  onTradesAndServicesChange(tradesAndServiceTypes) {
    this.tradesAndServiceTypes = tradesAndServiceTypes;
    console.log(this.tradesAndServiceTypes);
  }

  updateCompanyTradesAndServiceTypes() {
    if (this.tradesAndServiceTypes.services.every(service => service.enabled == false)) {
      this.popUpMessageService.showWarning('You should have at least one Service');
      return;
    }
    this.companyService.updateCompanyTradesAndServiceTypes(this.securityService.getLoginModel().company, this.tradesAndServiceTypes).subscribe(
      response => {
        this.popUpMessageService.showSuccess('Your Trade and Services configuration is updated');
      },
      err => {
        console.log(err);
        this.popUpMessageService.showError(getErrorMessage(err));
      });
  }

}
