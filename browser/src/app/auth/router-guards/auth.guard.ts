import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateChild,
  CanLoad, Route,
  Router,
  RouterStateSnapshot, UrlSegment
} from '@angular/router';
import { SecurityService } from '../security.service';
import { Injectable } from '@angular/core';

@Injectable()
export class AuthGuard implements CanActivate, CanActivateChild, CanLoad {
  constructor(private router: Router, private securityService: SecurityService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.canActivateInternal(route, state);
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.canActivateInternal(route, state);
  }



  canLoad(route: Route, segments: UrlSegment[]): boolean {
    if (!this.securityService.isAuthenticated()) {
      this.securityService.returnUrl = route.path;
      this.router.navigate([ '/login' ]);
      return false;
    }
    return true;
  }

  private canActivateInternal(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (!this.securityService.isAuthenticated()) {
      this.securityService.returnUrl = state.url;
      this.router.navigate([ '/login' ]);
      return false;
    }
    return true;
  }


}
