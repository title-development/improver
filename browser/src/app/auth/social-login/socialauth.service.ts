import { Inject, Injectable } from '@angular/core';
import { AsyncSubject, Observable, ReplaySubject } from 'rxjs';
import { LoginProvider } from './entities/login-provider';
import { SocialUser } from './entities/social-user';

export interface SocialAuthServiceConfig {
  autoLogin?: boolean;
  providers: { id: string; provider: LoginProvider }[];
}

/** @dynamic */
@Injectable()
export class SocialAuthService {
  private static readonly ERR_LOGIN_PROVIDER_NOT_FOUND =
    'Login provider not found';
  private static readonly ERR_NOT_LOGGED_IN = 'Not logged in';
  private static readonly ERR_NOT_INITIALIZED = 'Login providers not ready yet. Are there errors on your console?';

  private _providers: Map<string, LoginProvider> = new Map();
  private autoLogin = false;

  private _user: SocialUser = null;
  private _authStateChange: ReplaySubject<Map<string, boolean>> = new ReplaySubject(1);
  /** _authState is a {@link Map} collection that contains {@link string} providerId as kay and {@link boolean} isLoggedIn as value. */
  private _authState: Map<string, boolean> = new Map();

  private initialized = false;
  private _initState: AsyncSubject<boolean> = new AsyncSubject();

  get authStateChange(): Observable<Map<string, boolean>> {
    return this._authStateChange.asObservable();
  }

  get initState(): Observable<boolean> {
    return this._initState.asObservable();
  }

  getProvider(providerId): LoginProvider {
    return this._providers.get(providerId);
  }

  constructor(
    @Inject('SocialAuthServiceConfig')
      config: SocialAuthServiceConfig | Promise<SocialAuthServiceConfig>,
  ) {
    if (config instanceof Promise) {
      config.then((config) => {
        this.initialize(config);
      });
    } else {
      this.initialize(config);
    }
  }

  private initialize(config: SocialAuthServiceConfig) {
    this.autoLogin = config.autoLogin !== undefined ? config.autoLogin : false;

    config.providers.forEach((item) => {
      this._providers.set(item.id, item.provider);
      this._authState.set(item.id, false)
    });

    Promise.all(
      Array.from(this._providers.values()).map((provider) =>
        provider.initialize(),
      ),
    )
      .then(() => {
        this.initialized = true;
        this._initState.next(this.initialized);
        this._initState.complete();

        if (this.autoLogin) {
          const loginStatusPromises = [];
          let loggedIn = false;

          this._providers.forEach((provider: LoginProvider, key: string) => {
            let promise = provider.getProfile(undefined, false);
            loginStatusPromises.push(promise);
            promise
              .then((user: SocialUser) => {
                user.provider = key;

                this._user = user;
                this.changeAuthState(provider.PROVIDER_ID, true)
                loggedIn = true;
              })
              .catch(error => {
                console.debug(error)
                this.changeAuthState(provider.PROVIDER_ID, false)
              });
          });
          Promise.all(loginStatusPromises).catch(() => {
            if (!loggedIn) {
              this._user = null;
            }
          });
        }
      })
      .catch(console.error);
  }

  signIn(providerId: string, signInOptions?: any): Promise<SocialUser> {
    return new Promise((resolve, reject) => {
      if (!this.initialized) {
        reject(SocialAuthService.ERR_NOT_INITIALIZED);
      } else {
        let providerObject = this._providers.get(providerId);
        if (providerObject) {
          providerObject
            .signIn(signInOptions)
            .then((user: SocialUser) => {
              user.provider = providerId;
              resolve(user);

              this._user = user;
              this.changeAuthState(providerId, true)
            })
            .catch((err) => {
              reject(err);
            });
        } else {
          reject(SocialAuthService.ERR_LOGIN_PROVIDER_NOT_FOUND);
        }
      }
    });
  }

  signOut(revoke: boolean = false): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.initialized) {
        reject(SocialAuthService.ERR_NOT_INITIALIZED);
      } else if (!this._user) {
        reject(SocialAuthService.ERR_NOT_LOGGED_IN);
      } else {
        let providerId = this._user.provider;
        let providerObject = this._providers.get(providerId);
        if (providerObject) {
          providerObject
            .signOut(revoke)
            .then(() => {
              resolve();

              this._user = null;
              this.changeAuthState(providerId, false)
            })
            .catch((err) => {
              reject(err);
            });
        } else {
          reject(SocialAuthService.ERR_LOGIN_PROVIDER_NOT_FOUND);
        }
      }
    });
  }

  private changeAuthState(providerId: string, isLoggedIn: boolean) {
    this._authState.set(providerId, isLoggedIn)
    this._authStateChange.next(this._authState)
  }

}
