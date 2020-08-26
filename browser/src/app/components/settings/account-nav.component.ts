import { Component } from '@angular/core';
import { SecurityService } from "../../auth/security.service";
import { Role } from "../../model/security-model";

@Component({
  selector: 'account-nav',
  templateUrl: './account-nav.component.html',
  styleUrls: ['./account-nav.component.scss']
})

export class AccountNavComponent {

  public Role = Role;

  constructor(public securityService: SecurityService) {

  }

}
