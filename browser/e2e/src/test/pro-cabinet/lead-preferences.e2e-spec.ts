import { users } from "../../../test.data";
import { login, logout } from "../../utils/common.functions";
import { browser, by, element } from "protractor";
import { menuLinkText, pageTitle, SECOND } from "../../utils/constants";
import { userMenu } from "../../utils/util";

describe('Scheduling Page', () => {

  let contractor = users.contractor;

  beforeEach(() => {

    login(contractor.email, contractor.password);
    browser.sleep(SECOND);
  });

  afterEach(() => {
    logout();
  });

  it('should display lea preferences card titles', () => {
    userMenu.click();
    browser.sleep(SECOND);
    element(by.partialLinkText(menuLinkText.leadPreferences)).click();
    browser.sleep(SECOND);
    expect(element(by.css(".trades-and-services-card .account-title")).getText()).toEqual(pageTitle.services);
    expect(element(by.css(".scheduling-card .account-title")).getText()).toEqual(pageTitle.scheduling);
  });

});






