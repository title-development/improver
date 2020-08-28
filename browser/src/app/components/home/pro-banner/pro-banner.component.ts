import { Component, Input } from '@angular/core';
import { SecurityService } from "../../../auth/security.service";
import { Role } from '../../../model/security-model';

@Component({
  selector: 'pro-banner',
  templateUrl: 'pro-banner.component.html',
  styleUrls: ['pro-banner.component.scss']
})


export class ProBannerComponent {

  @Input() bannerConfig: any = {
    image: 'pro-banner.png',
    title: 'Help new clients find you!',
    text: 'Whether you’re just starting out, looking to grow your home improvement business, or interested in filling gaps in your work schedule, Home Improve can help you find clients in your target demographic.',
    button: 'Become a PRO',
    routerLink: '/become-pro'
  };

  Role = Role;
  constructor(public securityService: SecurityService) {
  }

}
