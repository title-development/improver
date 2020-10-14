import { Component } from '@angular/core';
import { MetricsEventService } from "../../api/services/metrics-event.service";

@Component({
  selector: 'home-page',
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.scss']
})
export class HomeComponent {

  constructor(private metricsEventService: MetricsEventService) {
    this.metricsEventService.fireLandingPageViewEvent()
  }

}
