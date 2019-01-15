import { SecurityService } from '../security.service';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateChild,
  CanLoad,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import { Role } from '../../model/security-model';
import { Injectable } from '@angular/core';

@Injectable()
export class AdminGuard implements CanActivate, CanActivateChild, CanLoad {
  constructor(private securityService: SecurityService, private router: Router) {

  }

  canActivate(): boolean {
    return this.canActivateInternal();
  }

  canActivateChild(): boolean {
    return this.canActivateInternal();
  }

  canLoad(): boolean {
    return this.canActivateInternal();
  }

  private canActivateInternal(): boolean {
    if (this.securityService.getRole() == Role.ADMIN
      || this.securityService.getRole() == Role.STAKEHOLDER
      || this.securityService.getRole() == Role.SUPPORT) {

      return true;
    } else {
      this.router.navigate([ '/403' ]);

      return false;
    }
  }
}
