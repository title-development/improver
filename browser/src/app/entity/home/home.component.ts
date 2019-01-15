import { Component } from '@angular/core';
import { SecurityService } from "../../auth/security.service";
import { Role } from '../../model/security-model';

@Component({
  selector: 'home-page',
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.scss']
})
export class HomeComponent {

  Role = Role;

  constructor(public securityService: SecurityService) {
  }
}
