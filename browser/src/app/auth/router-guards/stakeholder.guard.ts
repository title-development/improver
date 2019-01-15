import { SecurityService } from '../security.service';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Role } from '../../model/security-model';
import { Injectable } from '@angular/core';

@Injectable()
export class StakeholderGuard implements CanActivate {
  constructor(private securityService: SecurityService, private router: Router) {

  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.securityService.getRole() == Role.STAKEHOLDER) {

      return true;
    } else {
      this.router.navigate([ '/403' ]);

      return false;
    }
  }
}
