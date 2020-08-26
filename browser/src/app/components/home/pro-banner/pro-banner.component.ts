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
    title: 'Find new customers and grow your business with Home Improve',
    text: 'Whether you’re scaling your business, filling the gaps in your schedule, or just starting out, Home Improve will help you find the right customers.',
    button: 'Become a PRO',
    routerLink: '/become-pro'
  };

  Role = Role;
  constructor(public securityService: SecurityService) {
  }

}
