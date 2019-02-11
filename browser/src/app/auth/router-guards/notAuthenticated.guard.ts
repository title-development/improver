import { CanActivate, Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { SecurityService } from '../security.service';
import { Role } from '../../model/security-model';

@Injectable()
export class NotAuthenticatedGuard implements CanActivate {
  constructor(private securityService: SecurityService, private router: Router) {
  }

  canActivate() {
    if (this.securityService.isUserExistInLocalStorage()) {
      if(this.securityService.getLoginModel().role == Role.INCOMPLETE_PRO) {
        this.router.navigate(['/signup-pro', 'company'])
      } else {
        this.router.navigate([ '/' ]);
      }
      return false
    } else {
      return true;
    }
  }
}
