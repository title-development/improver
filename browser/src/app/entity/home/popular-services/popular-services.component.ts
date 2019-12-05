import {Component} from '@angular/core';
import {ServiceType} from '../../../model/data-model';
import { CustomerSuggestionService } from "../../../api/services/customer-suggestion.service";
import { ProjectActionService } from "../../../util/project-action.service";


@Component({
  selector: 'popular-services',
  templateUrl: 'popular-services.component.html',
  styleUrls: ['popular-services.component.scss']
})
export class PopularServicesComponent {
  suggestedServiceTypes: Array<ServiceType> = [];

  constructor(private customerSuggestionService: CustomerSuggestionService,
              public projectActionService: ProjectActionService) {

    this.customerSuggestionService.suggested$
      .subscribe(
        (serviceTypes: Array<ServiceType>) => this.suggestedServiceTypes = serviceTypes.slice(0, 8));
  }
}
