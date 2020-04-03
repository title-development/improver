import {Component} from '@angular/core';
import { ServiceType, Trade } from '../../../model/data-model';
import { CustomerSuggestionService } from "../../../api/services/customer-suggestion.service";
import { ProjectActionService } from "../../../util/project-action.service";


@Component({
  selector: 'advertisement-block',
  templateUrl: 'advertisement-block.component.html',
  styleUrls: ['advertisement-block.component.scss']
})
export class AdvertisementBlockComponent {
  advertised: Array<Trade> = [];

  constructor(private customerSuggestionService: CustomerSuggestionService,
              public projectActionService: ProjectActionService) {

    this.customerSuggestionService.suggestedTrades$
      .subscribe(
        (advertised: Array<Trade>) => this.advertised = advertised.slice(0, 8));
  }
}
