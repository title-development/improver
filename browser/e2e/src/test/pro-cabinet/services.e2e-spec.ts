import { BillingHelper } from "../../utils/billing.helper";
import { users } from "../../../test.data";
import { login, logout } from "../../utils/common.functions";
import { browser, by, element } from "protractor";
import { SECOND } from "../../utils/util";
import { menuLinkText, pageTitle } from "../../utils/constants";

describe('Services Page', () => {

  let contractor = users.contractor;

  beforeEach(() => {

    login(contractor.email, contractor.password);
    browser.sleep(SECOND);
  });

  afterEach(() => {
    logout();
  });

  it('should display services title', () => {

    let userMenu = element(by.css(".header .user-name"));
    userMenu.isPresent().then(value => {
      if (value) {
        userMenu.click();
        browser.sleep(SECOND);
        element(by.linkText(menuLinkText.services)).click();
        browser.sleep(SECOND);
      }
    });

    expect(element(by.css(".account-nav-title")).getText()).toEqual(pageTitle.services);
  });

});






