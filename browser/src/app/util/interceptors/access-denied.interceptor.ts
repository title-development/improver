import {
  HTTP_INTERCEPTORS,
  HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable, Injector, Provider } from '@angular/core';

import { SecurityService } from '../../auth/security.service';
import { Router, RouterState, RouterStateSnapshot } from '@angular/router';
import { ErrorHandler } from '../error-handler';
import { getErrorMessage, notLoginPage } from '../functions';
import { PopUpMessageService } from '../pop-up-message.service';
import { tap } from "rxjs/internal/operators";



@Injectable()
export class AccessDeniedInterceptor implements HttpInterceptor {
  private errorHandler: ErrorHandler;

  /**
   * Injector needs to get SecurityService
   * because angular way injection making Cyclic dependency
   */
  constructor(private router: Router, private popUpService: PopUpMessageService, private injector: Injector) {
    this.errorHandler = this.injector.get(ErrorHandler);
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      tap(
        (event: HttpEvent<any>) => {
        },
        (err: any) => {
          if (err instanceof HttpErrorResponse) {
            switch (err.status) {
              case 403 : {
                // skip check
                if (request.url == SecurityService.CURRENT_PRINCIPAL_URL) {
                  break;
                }
                  const state: RouterState = this.router.routerState;
                  const snapshot: RouterStateSnapshot = state.snapshot;
                  const securityService: SecurityService = this.injector.get(SecurityService);
                  securityService.logoutFrontend();
                  if (notLoginPage(snapshot.url)) {
                    securityService.returnUrl = snapshot.url;
                    this.router.navigate(['login']);
                  }
                break;
              }
              default: {
                break;
              }
            }
          }
        }
      )
    )
  }
}
