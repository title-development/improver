import { SecurityService } from '../security.service';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Role } from '../../model/security-model';
import { Injectable } from '@angular/core';

@Injectable()
export class SupportGuard implements CanActivate {
  constructor(private securityService: SecurityService, private router: Router) {

  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {

    if (!this.securityService.isAuthenticated()) {
      this.securityService.returnUrl = state.url;
      this.router.navigate(['/admin/login']);
      return false;
    }

    if (this.securityService.getRole() == Role.ADMIN || this.securityService.getRole() == Role.SUPPORT) {
      return true;
    } else {
      this.router.navigate([ '/403' ]);

      return false;
    }
  }
}
