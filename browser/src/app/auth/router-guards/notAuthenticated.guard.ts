import { CanActivate, Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { SecurityService } from '../security.service';

@Injectable()
export class NotAuthenticatedGuard implements CanActivate {
  constructor(private securityService: SecurityService, private router: Router) {
  }

  canActivate() {
    if (this.securityService.isAuthenticated()) {
      this.router.navigate([ '/' ]);
      return false
    } else {
      return true;
    }
  }
}
