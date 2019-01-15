import { browser, by, element } from "protractor";

export class BillingHelper {

  constructor() {
  }

  public balanceLink() {
    element(by.css('.balance-bar')).click();
  }

  public radio(index) {
    element.all((by.css(".default-payment-card-form .cv-radio-group .input-holder .cv-radio .radio-circle"))).get(index).click();
  }
}
