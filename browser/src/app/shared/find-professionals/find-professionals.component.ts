import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { ServiceType, Trade } from '../../model/data-model';
import { ServiceTypeService } from '../../api/services/service-type.service';
import { TradeService } from '../../api/services/trade.service';
import { Constants } from '../../util/constants';
import { QuestionaryControlService } from '../../util/questionary-control.service';
import { ProjectActionService } from '../../util/project-action.service';
import { MediaQueryService } from '../../util/media-query.service';
import { markAsTouched } from '../../util/functions';
import { Router } from '@angular/router';
import { FindProfessionalService } from "../../util/find-professional.service";

@Component({
  selector: 'find-professionals',
  templateUrl: 'find-professionals.component.html',
  styleUrls: ['find-professionals.component.scss']
})

export class FindProfessionalsComponent implements OnInit {
  mainSearchFormGroup: FormGroup;
  serviceTypeCtrl: FormControl;
  popularServiceTypes: Array<ServiceType> = [];
  filteredServiceTypes: Array<ServiceType> = [];
  serviceTypes: Array<ServiceType> = [];
  popularServiceSize: Number;
  popularTrades: Array<Trade> = [];

  constructor(private serviceTypeService: ServiceTypeService,
              private questionaryControlService: QuestionaryControlService,
              private tradeService: TradeService,
              public dialog: MatDialog,
              public projectActionService: ProjectActionService,
              public constants: Constants,
              public media: MediaQueryService,
              private router: Router,
              public findProfessionalService: FindProfessionalService) {
    let group: any = {};

    group.serviceTypeCtrl = new FormControl(null, Validators.required);
    group.zipCodeCtrl = new FormControl(
      null,
      Validators.compose([Validators.required, Validators.pattern(constants.patterns.zipcode)])
    );

    this.mainSearchFormGroup = new FormGroup(group);
    this.serviceTypeCtrl = group.serviceTypeCtrl;

    this.getPopularServiceTypes();
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
    if(search) {
      this.filteredServiceTypes = this.serviceTypes.filter(service => {
        const regExp: RegExp = new RegExp(`\\b${search}`, 'gmi');
        return regExp.test(service.name);
      })
    }
  }

  ngOnInit() {

  }

  getPopularServiceTypes() {
    this.serviceTypeService.popular$
      .subscribe(
        popularServiceTypes => {
          this.popularServiceTypes = popularServiceTypes;
        },
        err => {
          console.log(err);
        }
      );
  }

  getPopularTrades() {
    this.tradeService.popular$
      .subscribe(
        popularTrades => this.popularTrades = popularTrades,
        err => {
          console.log(err);
        }
      );
  }

  searchServiceType(form: FormGroup) {
    if (this.mainSearchFormGroup.valid) {
      this.findProfessionalService.showDropdown = false;
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
      this.router.navigate(['search'], { queryParams: { service: formData.serviceTypeCtrl, zip: formData.zipCodeCtrl } });
    }
  }

  getServiceTypes(): void {
    this.serviceTypeService.serviceTypes$
      .subscribe(
        (serviceTypes: Array<ServiceType>) => {
          this.serviceTypes = this.filteredServiceTypes = serviceTypes;
        },
        err => {
          console.log(err);
        });
  }

  selectTrackBy(index: number, item: ServiceType): number {
    return item.id;
  }

}
