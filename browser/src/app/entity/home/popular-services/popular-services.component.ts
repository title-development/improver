import {Component} from '@angular/core';
import {ServiceType} from '../../../model/data-model';
import {ServiceTypeService} from '../../../api/services/service-type.service';


@Component({
  selector: 'popular-services',
  templateUrl: 'popular-services.component.html',
  styleUrls: ['popular-services.component.scss']
})
export class PopularServicesComponent {
  suggestedServiceTypes: Array<ServiceType> = [];

  constructor(private serviceTypesService: ServiceTypeService) {

    this.serviceTypesService.suggested$
      .subscribe(
        (serviceTypes: Array<ServiceType>) => this.suggestedServiceTypes = serviceTypes.slice(0, 8));
  }
}
