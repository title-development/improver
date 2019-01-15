import { Component, Inject } from '@angular/core';

import { ScrollService } from "../../../util/scroll.service";
import { PhoneHelpService } from "../../../util/phone-help.service";

@Component({
  selector: 'home-footer',
  templateUrl: 'home-footer.component.html',
  styleUrls: ['home-footer.component.scss']
})


export class HomeFooterComponent {

  constructor(
    @Inject('Window') public window: Window,
    public scrollService: ScrollService,
    public phoneHelpService: PhoneHelpService,
  ) {}

  goToUrl(url) {
    window.location.href = url;
  }

  openInNewTab(url) {
    window.open(url, "_blank");
  }



}
