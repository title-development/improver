export class SocialConnection {
  id: number;
  providerId: string;
  created: string;
  provider: SocialConnection.Provider;
}

export namespace SocialConnection {
  export enum Provider {
    FACEBOOK = 'FACEBOOK',
    GOOGLE = 'GOOGLE'
  }
}
