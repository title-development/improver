import { BillingHelper } from "../../utils/billing.helper";
import { users } from "../../../test.data";
import { login, logout } from "../../utils/common.functions";
import { $, $$, browser, by, element } from "protractor";
import { SECOND } from "../../utils/util";
import { pageTitle, menuLinkText } from "../../utils/constants";

describe('Coverage Page', () => {

  let contractor = users.contractor;

  beforeEach(() => {

    login(contractor.email, contractor.password);
    browser.sleep(SECOND);
  });

  afterEach(() => {
    logout();
  });

  it('should display coverage configuration title', () => {

    let userMenu = element(by.css(".header .user-name"));
    userMenu.isPresent().then(value => {
      if (value) {
        userMenu.click();
        browser.sleep(SECOND);
        element(by.linkText(menuLinkText.coverage)).click();
        browser.sleep(SECOND);
      }
    });

    element(by.linkText('Got it')).click();

    expect(element(by.css(".config h4")).getText()).toEqual(pageTitle.coverage);
  });

});






