import { Component } from '@angular/core';
import { SecurityService } from "../../../auth/security.service";
import { Role } from '../../../model/security-model';

@Component({
  selector: 'pro-banner',
  templateUrl: 'pro-banner.component.html',
  styleUrls: ['pro-banner.component.scss']
})


export class ProBannerComponent {

  Role = Role;
  constructor(public securityService: SecurityService) {
  }

}
