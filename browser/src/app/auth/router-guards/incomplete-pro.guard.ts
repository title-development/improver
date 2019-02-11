import { CanActivate, CanActivateChild, Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { SecurityService } from '../security.service';
import { Role } from 'app/model/security-model';

@Injectable()
export class IncompleteProGuard implements CanActivate, CanActivateChild {
  constructor(private securityService: SecurityService, private router: Router) {
  }

  canActivate(): boolean {
    return this.canActivateInternal();
  }

  canActivateChild(): boolean {
    return this.canActivateInternal();
  }

  private canActivateInternal() {
    if (this.securityService.isUserExistInLocalStorage() && this.securityService.getRole() == Role.INCOMPLETE_PRO) {

      return true;
    } else {
      this.router.navigate(['/signup-pro']);

      return false;
    }
  }

}
