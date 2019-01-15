import { Component } from '@angular/core';

import { ScrollService } from "../../../util/scroll.service";

@Component({
  selector: 'customer-banner',
  templateUrl: 'customer-banner.component.html',
  styleUrls: ['customer-banner.component.scss']
})


export class CustomerBannerComponent {

  constructor(
    public scrollService: ScrollService
  ) {}



}
