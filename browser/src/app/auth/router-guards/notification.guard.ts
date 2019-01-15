import { CanActivate, Router } from '@angular/router';
import { SecurityService } from '../security.service';
import { Role } from '../../model/security-model';
import { Injectable } from '@angular/core';

@Injectable()
export class NotificationGuard implements CanActivate {
  constructor(private securityService: SecurityService, private router: Router) {
  }

  canActivate(): boolean {
    if (this.securityService.getRole() == Role.CUSTOMER) {

      return true;
    } else {
      this.router.navigate([ 'pro/settings/notifications' ]);

      return false;
    }
  }

}
