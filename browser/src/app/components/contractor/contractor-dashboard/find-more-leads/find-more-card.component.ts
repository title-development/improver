import { Component, Input } from '@angular/core';


import { Lead } from '../../../../model/data-model';
import { RestPage } from '../../../../api/models/RestPage';

@Component({
  selector: 'dashboard-find-more-leads',
  templateUrl: './find-more-card.component.html',
  styleUrls: ['./find-more-card.component.scss']
})
export class DashboardMapComponent {
  @Input() leads: RestPage<Lead>;
  @Input() inlineMode: boolean;
}
