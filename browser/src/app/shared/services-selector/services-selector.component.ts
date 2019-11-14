import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, NgForm } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material';
import { Constants } from '../../util/constants';
import { ActivatedRoute } from '@angular/router';
import { SecurityService } from '../../auth/security.service';
import { TradeService } from '../../api/services/trade.service';
import { ServiceTypeService } from '../../api/services/service-type.service';
import { PopUpMessageService } from '../../util/pop-up-message.service';
import { getErrorMessage } from '../../util/functions';
import { Trade } from '../../model/data-model';
import { dialogsMap } from '../dialogs/dialogs.state';
import { confirmDialogConfig } from '../dialogs/dialogs.configs';
import { combineLatest, ReplaySubject } from 'rxjs';
import { ScrollHolderService } from '../../util/scroll-holder.service';


@Component({
  selector: 'services-selector',
  templateUrl: './services-selector.component.html',
  styleUrls: ['./services-selector.component.scss']
})

export class ServicesSelectorComponent implements OnInit {

  @Input()
  initialData;

  tradesAndServiceTypes = {
    trades: [],
    services: []
  };
  @Output()
  onUpdate: EventEmitter<any> = new EventEmitter<any>();
  @Output()
  onInitialized: ReplaySubject<any> = new ReplaySubject<any>(1);
  autocompleteData = [];
  filteredData: any;
  tradesControl: FormGroup;
  public confirmDialogRef: MatDialogRef<any>;
  selectedServiceTypesCount: number;
  model = {
    addingItem: ''
  };

  allTrades;
  allServices;

  private HIGHLIGHT_TIME: number = 4000;

  constructor(public constants: Constants,
              public route: ActivatedRoute,
              public securityService: SecurityService,
              private tradeService: TradeService,
              public dialog: MatDialog,
              private serviceTypeService: ServiceTypeService,
              public  popUpMessageService: PopUpMessageService,
              public scrollHolder: ScrollHolderService) {
    this.getTradesAndServiceTypes();
  }

  ngOnInit() {
    this.tradesAndServiceTypes = this.initialData ? this.initialData : this.tradesAndServiceTypes;
    this.handleCompanyTradesAndServiceTypes();
  }

  initCheckboxControl() {
    let checkboxControlNames = {};
    for (let trade of this.tradesAndServiceTypes.trades) {
      let checkedServices = trade.services.filter(item => item.enabled).map(item => item.id);
      checkboxControlNames[trade.name] = new FormControl(checkedServices);
    }
    this.tradesControl = new FormGroup(checkboxControlNames);
  }

  onServiceCheck(item) {
    console.log('onServiceCheck');
    console.log(this.tradesControl);
    this.tradesAndServiceTypes.services.forEach((service, index) => {
      if (service.id == item.id) {
        service.enabled = !service.enabled;

        if (item.parentId == service.parentId)
          return;

        let tradeIndex = this.tradesAndServiceTypes.trades.findIndex((obj => obj.id == service.parentId));
        let tradeName = this.tradesAndServiceTypes.trades[tradeIndex].name;
        let innerServiceIndex = this.tradesControl.controls[tradeName].value.indexOf(service.id);
        if (innerServiceIndex < 0) {
          this.tradesControl.controls[tradeName].value.push(service.id);
        } else {
          this.tradesControl.controls[tradeName].value.splice(innerServiceIndex, 1);
        }
        this.tradesControl.controls[tradeName].setValue(this.tradesControl.controls[tradeName].value);

      }
    });
    if (this.tradesAndServiceTypes.services.every(service => service.enabled == false)) {
      this.popUpMessageService.showWarning('You should have at least one Service');
      this.tradesAndServiceTypes.services.forEach((service, index) => {
        if (service.id == item.id) {
          let tradeIndex = this.tradesAndServiceTypes.trades.findIndex((obj => obj.id == service.parentId));
          let tradeName = this.tradesAndServiceTypes.trades[tradeIndex].name;
          service.enabled = true;
          setTimeout(() => {
            this.tradesControl.controls[tradeName].setValue([service.id]);
          }, 0);
        }
      });
    }
    this.updateTradesAndServices();
  }

  handleCompanyTradesAndServiceTypes() {

    let tradesMap = {};
    let trades = [];

    for (let trade of this.tradesAndServiceTypes.trades) {
      trade.services = [];
      tradesMap[trade.id] = trade;
    }

    for (let service of this.tradesAndServiceTypes.services) {
      if (tradesMap[service.parentId]) {
        tradesMap[service.parentId].services.push(service);
      } else {
        if (!tradesMap[0]) {
          tradesMap[0] = {
            id: 0,
            name: 'Others',
            services: []
          };
        }
        tradesMap[0].services.push(service);
      }
    }

    Object.keys(tradesMap).forEach(key => {
      trades.push(tradesMap[key]);
    });

    trades.sort((a, b) => a.name.localeCompare(b.name));
    this.tradesAndServiceTypes.trades = trades;
    this.initCheckboxControl();

  }

  getTradesAndServiceTypes() {
    combineLatest([this.tradeService.trades$, this.serviceTypeService.serviceTypes$])
      .subscribe(results => {
        this.allTrades = results[0];
        this.allServices = results[1];
        this.onInitialized.next();
        this.autocompleteData.push({
          label: 'Trades',
          content: this.allTrades
        }, {
          label: 'Services',
          content: this.allServices
        });
        this.filteredData = this.autocompleteData;
      });

  }

  addItem(form: NgForm) {
    if (!this.model.addingItem || this.model.addingItem == '') {
      return;
    }
    let item = this.model.addingItem as any;
    console.log(item);
    let tradeIndex = this.allTrades.findIndex((obj => obj.name == item.name));
    if (tradeIndex >= 0) {
      this.addTrade(item);
    } else {
      this.addService(item);
    }
    form.reset();
  }

  addService(service) {
    let serviceIndex = this.tradesAndServiceTypes.services.findIndex((obj => obj.id == service.id));
    if (serviceIndex < 0) {
      service.enabled = true;
      service.highlight = true;
      setTimeout(() => service.highlight = false, this.HIGHLIGHT_TIME);
      this.tradesAndServiceTypes.services.push(service);
      let othersIndex = this.tradesAndServiceTypes.trades.findIndex((obj => obj.id == 0));
      let othersTrade;
      if (othersIndex < 0) {
        othersTrade = {
          id: 0,
          name: 'Others',
          services: [service],
          collapsed: true
        };
        this.tradesAndServiceTypes.trades.push(othersTrade);
      } else {
        this.tradesAndServiceTypes.trades.forEach(trade => trade.collapsed = false);
        this.tradesAndServiceTypes.trades[othersIndex].collapsed = true;
        this.tradesAndServiceTypes.trades[othersIndex].services.push(service);
        this.tradesAndServiceTypes.trades[othersIndex].services.sort((a, b) => a.name.localeCompare(b.name));
      }
      this.initCheckboxControl();
      this.popUpMessageService.showSuccess('<b>' + service.name + '</b> is successfully added to your service list');
    } else if (serviceIndex >= 0 && this.tradesAndServiceTypes.services[serviceIndex].enabled == false) {
      this.tradesAndServiceTypes.trades.forEach(trade => trade.collapsed = false);
      this.tradesAndServiceTypes.services[serviceIndex].enabled = true;
      this.tradesAndServiceTypes.services[serviceIndex].highlight = true;
      setTimeout(() => this.tradesAndServiceTypes.services[serviceIndex].highlight = false, this.HIGHLIGHT_TIME); //disable highliht

      for (let trade of this.tradesAndServiceTypes.trades) {
        for (let tradeService of trade.services) {
          if (tradeService.id == service.id) {
            trade.collapsed = true;
            tradeService.enabled = true;
            let value = this.tradesControl.controls[trade.name].value;
            value.push(service.id);
            this.tradesControl.controls[trade.name].patchValue(value);
          }
        }
      }
      this.popUpMessageService.showSuccess('<b>' + service.name + '</b> is successfully added to your service list');
    } else {
      this.popUpMessageService.showSuccess('<b>' + service.name + '</b> is already in your service list');
    }
    this.updateTradesAndServices();
  }

  addTrade(trade) {
    let tradeIndex = this.tradesAndServiceTypes.trades.findIndex((obj => obj.id == trade.id));
    if (tradeIndex < 0) {
      this.tradeService.getServiceTypes(trade.id)
        .subscribe(
          s => {
            let services = s as any;
            let othersIndex = this.tradesAndServiceTypes.trades.findIndex((obj => obj.id == 0));
            let others = othersIndex >= 0 ? this.tradesAndServiceTypes.trades.splice(othersIndex, 1)[0] : null;
            trade.services = [];
            for (let service of services) {
              service.enabled = true;
              service.parentId = trade.id;
              this.tradesAndServiceTypes.services.push(service);
              trade.services.push(service);
              if (!others) continue;
              let serviceIndex = others.services.findIndex((obj => obj.id == service.id));
              if (serviceIndex < 0) continue;
              others.services.splice(serviceIndex, 1);
            }
            this.tradesAndServiceTypes.trades.forEach(trade => trade.collapsed = false);
            trade.collapsed = true;
            this.tradesAndServiceTypes.trades.push(trade);
            this.tradesAndServiceTypes.trades.sort((a, b) => a.name.localeCompare(b.name));
            others && others.services.length > 0 ? this.tradesAndServiceTypes.trades.push(others) : null;
            this.initCheckboxControl();
            this.popUpMessageService.showSuccess('All services form <b>' + trade.name + '</b> have been added to your service list');
            this.updateTradesAndServices();
          },
          err => {
            this.popUpMessageService.showError(getErrorMessage(err));
          });
    } else {
      this.popUpMessageService.showSuccess('<b>' + trade.name + '</b> is already in your service list, you can configure it below');
    }
  }

  removeTrade(trade: Trade) {

    let othersIndex = this.tradesAndServiceTypes.trades.findIndex((obj => obj.id == 0));
    let minTradesCount = othersIndex < 0 ? 1 : 2;

    if (trade.id != 0 && this.tradesAndServiceTypes.trades.length <= minTradesCount) {
      this.popUpMessageService.showWarning('You should have at least one Trade');
      return;
    } else if (trade.id == 0 && this.tradesAndServiceTypes.trades.length <= 1) {
      this.popUpMessageService.showWarning('You should have at least one Trade');
      return;
    }

    let properties = {
      title: 'Are you sure that you want to remove this Trade?',
      message: '',
      OK: 'Confirm',
      CANCEL: 'Cancel'
    };
    this.dialog.closeAll();
    this.confirmDialogRef = this.dialog.open(dialogsMap['confirm-dialog'], confirmDialogConfig);
    this.confirmDialogRef
      .afterClosed()
      .subscribe(result => {
        this.confirmDialogRef = null;
      });

    this.confirmDialogRef.componentInstance.properties = properties;
    this.confirmDialogRef.componentInstance.object = trade;
    this.confirmDialogRef.componentInstance.onConfirm.subscribe(
      trade => {
        if (trade.id == 0) {
          let others = this.tradesAndServiceTypes.trades[this.tradesAndServiceTypes.trades.length - 1];
          for (let service of others.services) {
            this.tradesAndServiceTypes.services = this.tradesAndServiceTypes.services.filter(function (item) {
              return (item.id != service.id);
            });
          }
        }
        let tradeIndex = this.tradesAndServiceTypes.trades.findIndex((obj => obj.id == trade.id));
        if (tradeIndex >= 0) {
          this.tradesAndServiceTypes.trades.splice(tradeIndex, 1);
          this.tradesAndServiceTypes.services = this.tradesAndServiceTypes.services.filter(function (item) {
            return (item.parentId != trade.id);
          });
        }
        this.updateTradesAndServices();
      },
      err => {
        this.popUpMessageService.showError(getErrorMessage(err));
      }
    );
  }

  countSelectedServices() {
    this.selectedServiceTypesCount = this.tradesAndServiceTypes.services.filter(function (item) {
      return item.enabled;
    }).length;
  }

  filter(str: string) {
    if (str) {
      this.filteredData = this.autocompleteData.map(obj => {
        let clone = {...obj};
        clone.content = clone.content.filter(item => {
          const regExp: RegExp = new RegExp(`\\b${str}`, 'gmi');
          return regExp.test(item.name);
        });
        if (clone.content.length > 0) {
          return clone;
        } else {
          return null;
        }
      }).filter(item => item != null);
    } else {
      this.filteredData = this.autocompleteData;
    }
  }

  trackById(index, item) {
    return item.id;
  }

  updateTradesAndServices() {
    let tradesAndServiceTypes = JSON.parse(JSON.stringify(this.tradesAndServiceTypes));
    let othersIndex = tradesAndServiceTypes.trades.findIndex((obj => obj.id == 0));
    othersIndex >= 0 ? tradesAndServiceTypes.trades.splice(othersIndex, 1) : null;
    for (let trade of tradesAndServiceTypes.trades) {
      delete trade.services;
    }
    this.onUpdate.emit(tradesAndServiceTypes);
  }

}
