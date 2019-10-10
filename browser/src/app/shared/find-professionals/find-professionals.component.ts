import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ServiceType, Trade } from '../../model/data-model';
import { ServiceTypeService } from '../../api/services/service-type.service';
import { TradeService } from '../../api/services/trade.service';
import { Constants } from '../../util/constants';
import { QuestionaryControlService } from '../../util/questionary-control.service';
import { ProjectActionService } from '../../util/project-action.service';
import { MediaQueryService } from '../../util/media-query.service';
import { getErrorMessage, markAsTouched } from '../../util/functions';
import { Router } from '@angular/router';
import { FindProfessionalService } from '../../util/find-professional.service';
import { PopUpMessageService } from "../../util/pop-up-message.service";
import { combineLatest } from "rxjs";
import * as lunr from "lunr";

@Component({
  selector: 'find-professionals',
  templateUrl: 'find-professionals.component.html',
  styleUrls: ['find-professionals.component.scss']
})

export class FindProfessionalsComponent implements OnInit {
  mainSearchFormGroup: FormGroup;
  serviceTypeCtrl: FormControl;
  suggestedServiceTypes: Array<ServiceType> = [];
  popularServiceTypes: Array<ServiceType> = [];
  filteredServiceTypes: Array<ServiceType> = [];
  serviceTypes: Array<ServiceType> = [];
  popularServiceSize: Number;
  popularTrades: Array<Trade> = [];
  lunrIndex;

  constructor(private serviceTypeService: ServiceTypeService,
              private questionaryControlService: QuestionaryControlService,
              private tradeService: TradeService,
              private router: Router,
              private popUpService: PopUpMessageService,
              public dialog: MatDialog,
              public projectActionService: ProjectActionService,
              public constants: Constants,
              public media: MediaQueryService,
              public findProfessionalService: FindProfessionalService) {
    let group: any = {};

    group.serviceTypeCtrl = new FormControl(null, Validators.required);
    group.zipCodeCtrl = new FormControl(
      null,
      Validators.compose([Validators.required, Validators.pattern(constants.patterns.zipcode)])
    );

    this.mainSearchFormGroup = new FormGroup(group);
    this.serviceTypeCtrl = group.serviceTypeCtrl;

    this.getSuggestedServiceTypes();
    this.getPopularTrades();
    this.getServiceTypes();

    this.media.screen.subscribe(media => {
      if (media.xs || media.sm) {
        this.popularServiceSize = 8;
      }
      if (media.md || media.lg || media.xlg) {
        this.popularServiceSize = 16;
      }
    });
  }

  autocompleteSearch(search): void {
    if (search) {
      this.deepSearch(search);
    } else if (this.filteredServiceTypes.length > 0) {
      this.filteredServiceTypes = this.popularServiceTypes;
    }
  }

  deepSearch(search: string) {
    if(this.lunrIndex) {
      this.filteredServiceTypes = this.lunrIndex.search(`${search}*`)
        .map(item => this.serviceTypes.find(service => item.ref == service.id));
    }
  }

  ngOnInit() {

  }

  getSuggestedServiceTypes() {
    this.serviceTypeService.suggested$
      .subscribe(
        suggestedServiceTypes => this.suggestedServiceTypes = suggestedServiceTypes
      );
  }

  getPopularTrades() {
    this.tradeService.popular$
      .subscribe(
        popularTrades => this.popularTrades = popularTrades,
      );
  }

  searchServiceType(form: FormGroup) {
    if (this.mainSearchFormGroup.valid) {
      this.findProfessionalService.close();
      this.getQuestianary(this.serviceTypeCtrl.value);
      form.reset();
      Object.values(form.controls).forEach(control => control.markAsPristine());
    } else {
      markAsTouched(this.mainSearchFormGroup);
    }
  }

  getQuestianary(serviceType: ServiceType | string): void {
    const formData = this.mainSearchFormGroup.value;
    if (typeof serviceType != 'string') {
      this.find(serviceType, formData);
    } else {
      const filtered = this.serviceTypes.filter(item => item.name.toLowerCase() == serviceType.toLowerCase());
      if (filtered.length > 0) {
        this.find(filtered[0], formData);
      } else {
        this.find(serviceType, formData);
      }
    }
  }

  find(serviceType, formData): void {
    if (serviceType.id) {
      this.projectActionService.openQuestionary(serviceType, formData.zipCodeCtrl);
    } else {
      console.warn('Service type is not fount. Redirecting to custom search.');
      this.router.navigate(['search'], {queryParams: {service: formData.serviceTypeCtrl, zip: formData.zipCodeCtrl}});
    }
  }

  getServiceTypes(): void {
    let requests = combineLatest(this.serviceTypeService.serviceTypes$, this.serviceTypeService.popular$);

    requests.subscribe(
      results => {
        let serviceTypes = results[0];
        let popularServiceTypes = results[1];
        if (serviceTypes && serviceTypes.length > 0) {
          this.lunrIndex = lunr(function () {
            this.ref('id');
            this.field('name');
            serviceTypes.forEach(service => this.add(service));
          });
          this.serviceTypes = serviceTypes;
          this.filteredServiceTypes = this.popularServiceTypes = popularServiceTypes;
        }
      },
      err => this.popUpService.showError(getErrorMessage(err)));
  }

  selectTrackBy(index: number, item: ServiceType): number {
    return item.id;
  }

  mouseleave(event: Event): void {
    Object.values(this.mainSearchFormGroup.controls).forEach(control => {
      if (!control.value) {
        control.reset();
        control.markAsPristine();
      }
    });
  }

}
