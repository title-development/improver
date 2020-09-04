import { Injectable } from "@angular/core";

@Injectable({providedIn: "root"})
export class MobileMenuService {

  findProfessionalsOpened = false;
  mobileMenuOpened = false;
  notificationsPopupOpened = false;

  constructor() {
  }

  public toggleMobileMenu() {
    if(!this.mobileMenuOpened) {
      this.notificationsPopupOpened = false;
    }
    this.mobileMenuOpened = !this.mobileMenuOpened;
  }

  public toggleNotificationsPopupOpened() {
    if(!this.notificationsPopupOpened) {
      this.mobileMenuOpened = false;
    }
    this.notificationsPopupOpened = !this.notificationsPopupOpened;
  }


}
