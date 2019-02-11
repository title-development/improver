import {
  HTTP_INTERCEPTORS,
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Injectable, Injector, Provider } from '@angular/core';
import { BehaviorSubject, Observable, Subject, throwError } from 'rxjs';
import { SecurityService } from '../../auth/security.service';
import { catchError, delay, filter, finalize, first, switchMap, take } from 'rxjs/operators';
import { ErrorHandler } from '../error-handler';
import { ActivatedRoute, ActivatedRouteSnapshot, Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { OverlayRef } from '../../theme/util/overlayRef';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  private securityService: SecurityService;
  private router: Router;
  private dialog: MatDialog;
  private overlayRef: OverlayRef;
  private isRefreshingToken: boolean = false;
  private pendingQuery: Subject<string> = new Subject<string>();
  private securedBasePath: Array<string> = [
    '/pro',
    '/my',
    '/admin'
  ];

  /**
   * Injector needs to get SecurityService
   * because angular way injection making Cyclic dependency
   */
  constructor(private injector: Injector) {
    this.securityService = this.injector.get(SecurityService);
    this.router = this.injector.get(Router);
    this.dialog = this.injector.get(MatDialog);
    this.overlayRef = this.injector.get(OverlayRef);
  }

  /**
   * Refresh the jwt token after expiration.
   * Catch all 401 errors from requests, when token refresh has started,
   * we move error requests to the pending query.
   * on refreshing success we send pending request again
   */
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    return next.handle(this.addToken(request)).pipe(
      catchError(err => {
          if (err instanceof HttpErrorResponse) {
            if ((<HttpErrorResponse>err).status == 401 && request.url.indexOf('api/login') == -1) {
              if (!this.isRefreshingToken) {
                this.isRefreshingToken = true;
                if(this.securityService.isUserExistInLocalStorage()) {
                  return this.securityService.refreshAccessToken().pipe(
                    switchMap((accessToken: string) => {
                      this.pendingQuery.next(accessToken);

                      return next.handle(this.addToken(request));
                    }),
                    catchError(err => {
                      // for not secured pages
                      if(!this.securedBasePath.some(url => this.router.url.indexOf(url) > -1) && !this.securityService.isUserExistInLocalStorage()) {

                          return throwError(err);
                      }

                      this.securityService.systemLogout();
                      this.securityService.returnUrl = this.router.url;
                      this.dialog.closeAll();
                      this.overlayRef.removeBackdrop();
                      this.router.navigate(['/login']);

                      return throwError(err);
                    }),
                    finalize(() => {
                      this.isRefreshingToken = false;
                    })
                  );
                } else {
                  this.isRefreshingToken = false;

                  return throwError(err);
                }
              } else {
                /**
                 * process 401 error from securityService.refreshAccessToken()
                 * throwError will move request to the catchError {@see line 58}
                 */
                if (request.url == SecurityService.tokenRefreshUrl) {

                  return throwError(err);
                }
                //add to the pending query
                return this.pendingQuery.pipe(
                  first(),
                  switchMap(token => {

                    return next.handle(this.addToken(request));
                  })
                );
              }
            } else {

              return throwError(err);
            }
          } else {

            return throwError(err);
          }
        }
      )
    );
  }

  /**
   * Add jwt token to the same origin URLs
   * @param request
   * @return modified request
   */
  private addToken(request: HttpRequest<any>): HttpRequest<any> {
    // cross origin urls
    // http(s)://www.dddd@cccc.cc
    const regExp = new RegExp(/^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/gm);
    const crossOrigin = regExp.test(request.url);
    if (!crossOrigin && localStorage.getItem(SecurityService.TOKEN_STORAGE_KEY)) {
      request = request.clone({
        setHeaders: {
          Authorization: localStorage.getItem(SecurityService.TOKEN_STORAGE_KEY)
        }
      });
    }

    return request;
  }

}
