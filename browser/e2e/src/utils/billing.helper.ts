import { browser, by, element } from "protractor";
import { SECOND } from "./util";

export class BillingHelper {

  constructor() {
  }

  public balanceLink() {
    element(by.css('.balance-bar')).click();
  }

  public defaultPaymentCardRadio(index) {
    element.all((by.css(".default-payment-card-form .cv-radio-group .input-holder .cv-radio .radio-circle"))).get(index).click();
  }
}
