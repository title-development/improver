import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, NgForm } from '@angular/forms';
import { Constants } from '../../util/constants';
import { ActivatedRoute } from '@angular/router';
import { SecurityService } from '../../auth/security.service';
import { TradeService } from '../../api/services/trade.service';
import { ServiceTypeService } from '../../api/services/service-type.service';
import { PopUpMessageService } from '../../api/services/pop-up-message.service';
import { getErrorMessage } from '../../util/functions';
import { OfferedServiceType, ServiceType, Trade } from '../../model/data-model';
import { dialogsMap } from '../dialogs/dialogs.state';
import { confirmDialogConfig } from '../dialogs/dialogs.configs';
import { combineLatest, ReplaySubject, Subject } from 'rxjs';
import { ScrollHolderService } from '../../api/services/scroll-holder.service';
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { UserSearchService } from "../../api/services/user-search.service";
import { takeUntil } from "rxjs/operators";
import { MediaQuery, MediaQueryService } from "../../api/services/media-query.service";
import { Role } from "../../model/security-model";


@Component({
  selector: 'services-selector',
  templateUrl: './services-selector.component.html',
  styleUrls: ['./services-selector.component.scss']
})

export class ServicesSelectorComponent implements OnInit {

  @Input()
  initialData;
  Role = Role;

  tradesAndServiceTypes = {
    trades: [],
    services: []
  };
  @Output()
  onUpdate: EventEmitter<any> = new EventEmitter<any>();
  @Output()
  onInitialized: ReplaySubject<any> = new ReplaySubject<any>(1);
  autocompleteData: Array<any> = [];
  filteredData: Array<any> = [];
  tradesControl: FormGroup;
  public confirmDialogRef: MatDialogRef<any>;
  selectedServiceTypesCount: number;
  mediaQuery: MediaQuery;
  dropdownHeight: number = 3;
  private readonly destroyed$ = new Subject<void>();
  errorMessage: string;
  canDeleteTrade: EventEmitter<boolean> = new EventEmitter();
  model = {
    addingItem: ''
  };

  allTrades: Array<Trade> = [];
  allServices: Array<ServiceType> = [];

  newTradeServicesSize: number = 4;
  private HIGHLIGHT_TIME: number = 4000;

  constructor(public constants: Constants,
              public route: ActivatedRoute,
              public securityService: SecurityService,
              private tradeService: TradeService,
              public dialog: MatDialog,
              private serviceTypeService: ServiceTypeService,
              public  popUpMessageService: PopUpMessageService,
              public scrollHolder: ScrollHolderService,
              public userSearchService: UserSearchService,
              public mediaQueryService: MediaQueryService) {
    this.mediaQueryService.screen
      .pipe(takeUntil(this.destroyed$))
      .subscribe((mediaQuery: MediaQuery) => {
        this.mediaQuery = mediaQuery;
        this.dropdownHeight = mediaQuery.xs? 3: 4;
        this.newTradeServicesSize = mediaQuery.xs? 4: 8
      });

    this.getTradesAndServiceTypes();
  }

  ngOnInit() {
    this.tradesAndServiceTypes = this.initialData ? this.initialData : this.tradesAndServiceTypes;
    this.handleCompanyTradesAndServiceTypes();
  }

  getTradeSize(trade): number {
    return trade.new? this.newTradeServicesSize: trade.services.length;
  }

  initCheckboxControl() {
    let checkboxControlNames = {};
    for (let trade of this.tradesAndServiceTypes.trades) {
      let checkedServices = trade.services.filter(item => item.enabled).map(item => item.id);
      checkboxControlNames[trade.name] = new FormControl(checkedServices);
    }
    this.tradesControl = new FormGroup(checkboxControlNames);
  }

  onServiceCheck(item: OfferedServiceType) {
    this.tradesAndServiceTypes.services.forEach((service, index) => {
      if (service.id == item.id) {
        service.enabled = !service.enabled;

        if (item.tradeId == service.tradeId)
          return;

        let tradeIndex = this.tradesAndServiceTypes.trades.findIndex((obj => obj.id == service.tradeId));
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
      this.activateServiceCheckbox(item);
    }

    this.isLastServiceInTrade(item);
    this.updateTradesAndServices();
  }

  private isLastServiceInTrade(item: OfferedServiceType){
    let allTradeServices: Array<OfferedServiceType> = [];
    this.tradesAndServiceTypes.services.forEach( (service: OfferedServiceType) => {
      if (service.tradeId == item.tradeId){
        allTradeServices.push(service);
      }
    });

    if (allTradeServices.every(service => service.enabled == false)) {
      this.tradesAndServiceTypes.trades.forEach((trade: Trade) => {
        if (trade.id == item.tradeId) {
          this.removeTrade(trade);
        }
      });
      this.canDeleteTrade.subscribe(canDelete => {
        if (!canDelete) {
          this.activateServiceCheckbox(item);
          this.updateTradesAndServices();
        }
      })
    }
  }

  private activateServiceCheckbox(item) {
      this.tradesAndServiceTypes.services.forEach((service, index) => {
        if (service.id == item.id) {
          let tradeIndex = this.tradesAndServiceTypes.trades.findIndex((obj => obj.id == service.tradeId));
          let tradeName = this.tradesAndServiceTypes.trades[tradeIndex].name;
          service.enabled = true;
          setTimeout(() => {
            this.tradesControl.controls[tradeName].setValue([service.id]);
          }, 0);
        }
      });
  }

  handleCompanyTradesAndServiceTypes() {

    let tradesMap = {};
    let trades = [];

    for (let trade of this.tradesAndServiceTypes.trades) {
      trade.services = [];
      tradesMap[trade.id] = trade;
    }

    for (let service of this.tradesAndServiceTypes.services) {
      if (tradesMap[service.tradeId]) {
        tradesMap[service.tradeId].services.push(service);
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
      .subscribe(([trades, services]) => {
        this.allTrades = trades.map(trade => {
          (trade as any).type = 'trade';
          return trade;
        });
        this.allServices = services;
        this.onInitialized.next();
        this.autocompleteData = [...this.allTrades, ...this.allServices];
        this.filteredData = this.allTrades;
      });

  }

  search(form: NgForm) {
    if (!this.model.addingItem || this.model.addingItem == '') {
      return;
    }
    let itemModel = this.model.addingItem as any;
    let service: ServiceType;
    let trade: Trade;

    if (itemModel && itemModel.name && itemModel.id) {
      trade = this.allTrades.find(item => item.name.toLowerCase() == itemModel.name.toLowerCase() && item.id == itemModel.id);
      service = this.allServices.find(item => item.name.toLowerCase() == itemModel.name.toLowerCase() && item.id == itemModel.id);
    } else {
      trade = this.allTrades.find(item => item.name.toLowerCase() == itemModel.toLowerCase());
      service = this.allServices.find(item => item.name.toLowerCase() == itemModel.toLowerCase());
    }
    this.addCompanyProvidedServices(form, trade, service);
  }

  private addCompanyProvidedServices(form: NgForm, trade: Trade, service: ServiceType){
    if (trade) {
      this.addTrade(trade);
      form.resetForm();
    } else if (service) {
      this.addService(service);
      form.resetForm();
    } else {
      this.errorMessage = 'No Results'
    }
  }

  private addService(service) {
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

  private addTrade(trade) {
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
              service.tradeId = trade.id;
              this.tradesAndServiceTypes.services.push(service);
              trade.services.push(service);
              if (!others) continue;
              let serviceIndex = others.services.findIndex((obj => obj.id == service.id));
              if (serviceIndex < 0) continue;
              others.services.splice(serviceIndex, 1);
            }
            this.tradesAndServiceTypes.trades.forEach(trade => trade.collapsed = false);
            trade.collapsed = true;
            trade.new = true;
            //trade.services.
            this.tradesAndServiceTypes.trades.sort((a, b) => a.name.localeCompare(b.name));
            this.tradesAndServiceTypes.trades.unshift(trade);
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

	showMore(trade, collapsed?: boolean) {
		if (!collapsed) {
			setTimeout(() => {
				this.tradesAndServiceTypes.trades.map(t => {
					if (t.id == trade.id) {
						return t.new = false;
					}
				})
			}, 500);
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
    this.confirmDialogRef.componentInstance.onCancel.subscribe( () => {
      this.canDeleteTrade.emit(false);
    });
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
            return (item.tradeId != trade.id);
          });
        }
        this.updateTradesAndServices();
        this.canDeleteTrade.emit(true);
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

  autocompleteSearch(searchTerm: string) {
    if (this.errorMessage != ''){
      this.errorMessage = '';
    }
    if (searchTerm && searchTerm.length > 2) {
      // Raise up trades in array
      this.filteredData = this.userSearchService.getSearchResults(searchTerm).sort((a, b) => {
        return (a.services == b.services)? 0 : a.services? -1: 1;
      });
    } else {
      this.filterServicesAndTradesByRegExp(searchTerm);
    }
  }

  filterServicesAndTradesByRegExp(searchTerm: string) {
   if (searchTerm){
     this.filteredData = this.autocompleteData.filter( item => {
       const regExp: RegExp = new RegExp(`\\b${searchTerm.trim()}`, 'gmi');
       return regExp.test(item.name);
     });
   } else {
     this.filteredData = this.allTrades;
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
