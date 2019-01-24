import { BillingHelper } from "../../utils/billing.helper";
import { users } from "../../../test.data";
import { login, logout } from "../../utils/common.functions";
import { browser, by, element } from "protractor";
import { SECOND } from "../../utils/util";

describe('User Notifications Page', () => {

  let customer = users.customer;

  beforeEach(() => {

    login(customer.email, customer.password);
    browser.sleep(SECOND);
  });

  afterEach(() => {
    logout();
  });

  it('should display notifications title', () => {

    let userMenu = element(by.css(".header .user-name"));
    userMenu.isPresent().then(value => {
      if (value) {
        userMenu.click();
        browser.sleep(SECOND);
        element(by.linkText('Notifications')).click();
        browser.sleep(SECOND);
      }
    });

    expect(element(by.css(".account-nav-title")).getText()).toEqual("Notifications");
  });

});






