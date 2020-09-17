import { SocialUser } from './social-user';

export interface LoginProvider {
  PROVIDER_ID: string
  initialize(): Promise<void>;
	getLoginStatus(): Promise<boolean>;
  getProfile(signInOptions?: any, autoSignIn?: boolean): Promise<SocialUser>;
	signIn(signInOptions?: any): Promise<SocialUser>;
	signOut(revoke?: boolean): Promise<any>;
}

