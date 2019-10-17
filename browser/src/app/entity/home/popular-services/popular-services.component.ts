import {Component} from '@angular/core';
import {ServiceType} from '../../../model/data-model';
import {ServiceTypeService} from '../../../api/services/service-type.service';
import { CustomerSuggestionService } from "../../../api/services/customer-suggestion.service";


@Component({
  selector: 'popular-services',
  templateUrl: 'popular-services.component.html',
  styleUrls: ['popular-services.component.scss']
})
export class PopularServicesComponent {
  suggestedServiceTypes: Array<ServiceType> = [];

  constructor(private customerSuggestionService: CustomerSuggestionService,) {

    this.customerSuggestionService.suggested$
      .subscribe(
        (serviceTypes: Array<ServiceType>) => this.suggestedServiceTypes = serviceTypes.slice(0, 8));
  }
}
