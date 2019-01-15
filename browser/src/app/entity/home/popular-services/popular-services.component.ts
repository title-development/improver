import { Component } from '@angular/core';
import { ServiceType } from '../../../model/data-model';
import { ServiceTypeService } from '../../../api/services/service-type.service';
import { ProjectActionService } from '../../../util/project-action.service';



@Component({
  selector: 'popular-services',
  templateUrl: 'popular-services.component.html',
  styleUrls: ['popular-services.component.scss']
})
export class PopularServicesComponent {
  popularServiceTypes: Array<ServiceType> = [];

  constructor(private serviceTypesService: ServiceTypeService) {

    this.serviceTypesService.popular$
      .subscribe(
        (serviceTypes: Array<ServiceType>) => this.popularServiceTypes = serviceTypes.slice(0, 8));
  }
}
