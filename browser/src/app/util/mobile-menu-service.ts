import { Injectable } from "@angular/core";

@Injectable({providedIn: "root"})
export class MobileMenuService {

  findProfessionalsOpened = false;
  mobileMenuOpened = false;
  notificationsPopupOpened = false;

  constructor() {
  }

}
