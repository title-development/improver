import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { SecurityService } from '../security.service';
import { Injectable } from '@angular/core';
import { Role } from "../../model/security-model";

@Injectable()
export class ContractorHomeGuard implements CanActivate {
  constructor(private router: Router, private securityService: SecurityService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.securityService.hasRole(Role.CONTRACTOR)) {
      this.router.navigate(['/pro/dashboard']);
      return false;
    }
    return true;
  }
}
