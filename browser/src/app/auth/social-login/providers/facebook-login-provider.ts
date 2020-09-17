import { BaseLoginProvider } from '../entities/base-login-provider';
import { SocialUser } from '../entities/social-user';

declare let FB: any;

export class FacebookLoginProvider extends BaseLoginProvider {
  public static readonly PROVIDER_ID: string = 'FACEBOOK';

  constructor(
    private clientId: string,
    private initOptions: any = {
      scope: 'email,public_profile',
      locale: 'en_US',
      fields: 'name,email,picture,first_name,last_name',
      version: 'v4.0',
    }
  ) {
    super();
  }

  initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.loadScript(
        FacebookLoginProvider.PROVIDER_ID,
        `//connect.facebook.net/${this.initOptions.locale}/sdk.js`,
        () => {
          FB.init({
            appId: this.clientId,
            autoLogAppEvents: true,
            cookie: true,
            xfbml: true,
            version: this.initOptions.version,
          });

          resolve();
        }
      );
    });
  }

  getLoginStatus(): Promise<any> {
    return new Promise((resolve, reject) => {
      FB.getLoginStatus((response: any) => {
        if (response.status === 'connected') {
          resolve(response);
        } else {
          resolve(false);
        }
      });
    });
  }

  getProfile(signInOptions?: any, autoSignIn: boolean = true): Promise<SocialUser> {
    return new Promise((resolve, reject) => {
      this.getLoginStatus().then(loginStatusResponse => {

        if (loginStatusResponse) {

          FB.api(`/me?fields=${this.initOptions.fields}`, (profileResponse: any) => {

            if (profileResponse.error) {
              if (profileResponse.error.code == 190) {
                if (autoSignIn) {
                  this.signIn(signInOptions)
                    .then(resolve)
                    .catch(reject)
                } else {
                  reject(`No user is currently logged in with ${FacebookLoginProvider.PROVIDER_ID}`);
                }
              } else {
                reject(profileResponse.error.message)
              }
            } else {
              let user: SocialUser = new SocialUser();

              user.id = profileResponse.id;
              user.name = profileResponse.name;
              user.email = profileResponse.email;
              user.photoUrl =
                'https://graph.facebook.com/' +
                profileResponse.id +
                '/picture?type=normal';
              user.firstName = profileResponse.first_name;
              user.lastName = profileResponse.last_name;
              user.authToken = loginStatusResponse.authResponse.accessToken;
              user.provider = FacebookLoginProvider.PROVIDER_ID;

              user.response = profileResponse;

              resolve(user);
            }
          });
        } else {
          if (autoSignIn) {
            this.signIn(signInOptions)
              .then(resolve)
              .catch(reject)
          } else {
            reject(`No user is currently logged in with ${FacebookLoginProvider.PROVIDER_ID}`);
          }
        }
      })

    });
  }

  signIn(signInOptions?: any): Promise<SocialUser> {
    const options = {...this.initOptions, ...signInOptions};
    return new Promise((resolve, reject) => {
      FB.login((response: any) => {
        if (response.authResponse) {
          let authResponse = response.authResponse;
          FB.api(`/me?fields=${options.fields}`, (fbUser: any) => {
            let user: SocialUser = new SocialUser();

            user.id = fbUser.id;
            user.name = fbUser.name;
            user.email = fbUser.email;
            user.photoUrl =
              'https://graph.facebook.com/' +
              fbUser.id +
              '/picture?type=normal';
            user.firstName = fbUser.first_name;
            user.lastName = fbUser.last_name;
            user.authToken = authResponse.accessToken;
            user.provider = FacebookLoginProvider.PROVIDER_ID;

            user.response = fbUser;

            resolve(user);
          });
        } else {
          reject('User cancelled login or did not fully authorize.');
        }
      }, options);
    });
  }

  signOut(): Promise<any> {
    return new Promise((resolve, reject) => {
      FB.logout(resolve);
    });
  }

}
