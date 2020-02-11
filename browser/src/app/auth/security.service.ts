import { ApplicationRef, EventEmitter, Inject, Injectable } from '@angular/core';
import { Credentials, LoginModel, Role } from '../model/security-model';
import { ActivatedRoute, Router } from '@angular/router';
import { CompanyService } from '../api/services/company.service';
import { Observable, of, ReplaySubject, throwError } from 'rxjs';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { switchMap } from 'rxjs/operators';
import * as jwt_decode from 'jwt-decode';
import { JWT } from './Jwt.inteface';
import { MatDialog } from '@angular/material';
import { OverlayRef } from '../theme/util/overlayRef';

@Injectable()
export class SecurityService {
  public static readonly CURRENT_PRINCIPAL_URL = 'api/principal';
  public static readonly TOKEN_STORAGE_KEY = 'token';
  public static readonly USER_STORAGE_KEY = 'user';
  public static readonly USE_COOKIE_FOR_TOKENS = false;
  public static readonly loginUrl = 'api/login';
  public static readonly logoutUrl = 'api/logout';
  public static readonly tokenRefreshUrl = 'api/token/access';
  private static readonly BEARER_TOKEN_PREFIX = 'Bearer ';

  public onUserInit: ReplaySubject<any> = new ReplaySubject(1);
  public onLogout: EventEmitter<any> = new EventEmitter();
  localStorageHandler = (e) => this.onLocalStorageChange(e);
  private _returnUrl: string;

  constructor(private http: HttpClient,
              private companyService: CompanyService,
              private router: Router,
              private appRef: ApplicationRef,
              private route: ActivatedRoute,
              private dialog: MatDialog,
              private overlayRef: OverlayRef,
              @Inject('Window') private window: Window) {
    if (this.isAuthenticated()) {
      this.window.addEventListener('storage', this.localStorageHandler, false);
    }
  }

  /**
   * Method should be invoked on application startup / browser refresh
   * to get user login information
   */
  public getCurrentUser(isAppInit: boolean = false): void {
    this.http.get<LoginModel>(SecurityService.CURRENT_PRINCIPAL_URL).subscribe(
      account => {
        this.setLoginModel(account);
        if (isAppInit) {
          this.onUserInit.next(null);
        }
      });
  }


  public isAuthenticated(): boolean {
    return this.isUserExistInLocalStorage() && this.getLoginModel().role != Role.INCOMPLETE_PRO;
  }

  public isUserExistInLocalStorage(): boolean {
    return this.getLoginModel() != null;
  }

  public getLoginModel(): LoginModel {
    const user = localStorage.getItem(SecurityService.USER_STORAGE_KEY);
    try {
      return JSON.parse(user);
    } catch (e) {
      this.logoutFrontend();
      return null;
    }

  }

  public setLoginModel(user: LoginModel): void {
    localStorage.setItem(SecurityService.USER_STORAGE_KEY, JSON.stringify(user));
  }

  public hasRole(role: Role): boolean {
    return this.getRole() === role;
  }


  public getRole(): Role {
    let user = this.getLoginModel();
    return user ? user.role : Role.ANONYMOUS;
  }


  public sendLoginRequest(credentials: Credentials): Observable<HttpResponse<any>> {
    return this.http
      .post<HttpResponse<any>>(SecurityService.loginUrl, credentials, {observe: 'response'});
  }


  public loginUser(user: LoginModel, header: string, redirect?: boolean): Promise<boolean> {
    if (!SecurityService.USE_COOKIE_FOR_TOKENS) {
      this.setTokenHeader(header);
    }
    this.setLoginModel(user);
    if (user.role != Role.INCOMPLETE_PRO) {
      this.window.addEventListener('storage', this.localStorageHandler, false);
      this.onUserInit.next(null);

    }
    if (redirect) {
      const url = this._returnUrl;
      this._returnUrl = '';
      switch (user.role) {
        case Role.CUSTOMER:
         return this.router.navigateByUrl(url || '/');
        case Role.CONTRACTOR:
          return this.router.navigateByUrl(url || '/pro/dashboard');
        case Role.ADMIN:
          return this.router.navigateByUrl(url || '/admin');
        case Role.SUPPORT:
          return this.router.navigateByUrl(url || '/admin');
        case Role.INCOMPLETE_PRO:
          return this.router.navigateByUrl('/signup-pro/company');
        default:
          return this.router.navigateByUrl(url || '/');
      }
    }
    return Promise.resolve(true);
  }


  public getTokenHeader(): string {
    return localStorage.getItem(SecurityService.TOKEN_STORAGE_KEY);
  }


  public refreshAccessToken(): Observable<string> {
    return this.http
      .post<HttpResponse<any>>(SecurityService.tokenRefreshUrl, {}, {observe: 'response'})
      .pipe(switchMap((response: HttpResponse<any>) => {
          let accessHeader: string = response.headers.get('authorization');
          localStorage.setItem(SecurityService.TOKEN_STORAGE_KEY, accessHeader);

          return of(accessHeader);
        })
      );
  }


  public logout(): void {
    this.logoutFrontend();
    this.returnUrl = '';
    this.logoutBackend();
    this.dialog.closeAll();
    this.overlayRef.removeBackdrop();
    this.router.navigate(['/']);
  }


  public logoutFrontend() {
    localStorage.removeItem(SecurityService.TOKEN_STORAGE_KEY);
    localStorage.removeItem(SecurityService.USER_STORAGE_KEY);
    this.window.removeEventListener('storage', this.localStorageHandler, false);
    this.onLogout.emit();

  }

  private logoutBackend() {
    console.info('about to perform logout request to server');
    return this.http
      .post<HttpResponse<any>>(SecurityService.logoutUrl, {}, {observe: 'response'})
      .subscribe();
  }


  set returnUrl(value: string) {
    this._returnUrl = value;
  }


  private setTokenHeader(tokenHeader: string) {
    localStorage.setItem(SecurityService.TOKEN_STORAGE_KEY, tokenHeader);
  }

  public isTokenExpired(): boolean {
    let header: string = this.getTokenHeader();
    if (!!header) {
      let token: string = header.replace(SecurityService.BEARER_TOKEN_PREFIX, '');
      let jwt: JWT = jwt_decode(token) as JWT;
      return new Date().getTime() / 1000 > jwt.exp;
    } else {
      return true;
    }
  }

  private onLocalStorageChange(event) {
    if (event.storageArea == localStorage) {
      if (!this.isAuthenticated()) {
        this.logout();
      }
    }
  }

}
