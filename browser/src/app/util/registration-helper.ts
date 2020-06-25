import { Injectable } from "@angular/core";

@Injectable({providedIn: 'root'})
export class RegistrationHelper {

  public email: string;
  public isEmailEditable: boolean;

  constructor() {
  }

  reset() {
    this.email = null;
    this.isEmailEditable = null;
  }

}
