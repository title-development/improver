import { ApplicationRef, Component, HostListener, OnInit } from '@angular/core';
import { SecurityService } from '../../../../auth/security.service';
import { Constants } from '../../../../util/constants';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TradeService } from '../../../../api/services/trade.service';
import { ServiceTypeService } from '../../../../api/services/service-type.service';
import { CompanyService } from '../../../../api/services/company.service';
import { PopUpMessageService } from '../../../../util/pop-up-message.service';
import { getErrorMessage } from '../../../../util/functions';
import { ComponentCanDeactivate } from "../../../../auth/router-guards/component-can-deactivate.guard";
import { Observable } from "rxjs";
import { TradesAndServiceTypes } from "../../../../model/data-model";

@Component({
  selector: 'lead-preference',
  templateUrl: './lead-preference.component.html',
  styleUrls: ['./lead-preference.component.scss']
})

export class LeadPreferenceComponent implements OnInit, ComponentCanDeactivate {

  tradesAndServiceTypes;
  selectorInitialized = false;
  unsavedChanges = false;

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
      .subscribe((tradesAndServiceTypes: TradesAndServiceTypes) => {
          this.tradesAndServiceTypes = tradesAndServiceTypes;
          this.tradesAndServiceTypes.trades.forEach(trade => trade.collapsed = false);
        },
        err => {
          console.error(err);
          this.popUpMessageService.showError(getErrorMessage(err));
        });
  }

  onTradesAndServicesChange(tradesAndServiceTypes) {
    this.tradesAndServiceTypes = tradesAndServiceTypes;
    this.unsavedChanges = true;
    this.updateCompanyTradesAndServiceTypes()
  }

  updateCompanyTradesAndServiceTypes() {
    if (this.tradesAndServiceTypes.services.every(service => service.enabled == false)) {
      this.popUpMessageService.showWarning('You should have at least one Service');
      return;
    }
    this.companyService.updateCompanyTradesAndServiceTypes(this.securityService.getLoginModel().company, this.tradesAndServiceTypes)
      .subscribe(
      () => {
        this.unsavedChanges = false;
      });
  }

  canDeactivate(): Observable<boolean> | boolean {
    return !this.unsavedChanges;
  }

  @HostListener('window:beforeunload', ['$event']) unloadNotification(event): any {
    if (!this.canDeactivate()) {
      return false;
    }
  }

}
