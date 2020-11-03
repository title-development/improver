import { users } from "../../../test.data";
import { login, logout } from "../../utils/common.functions";
import { browser, by, element } from "protractor";
import { menuLinkText, pageTitle, SECOND } from "../../utils/constants";
import { userMenu } from "../../utils/util";

describe('Quick Reply Page', () => {

  let contractor = users.contractor;

  beforeEach(() => {

    login(contractor.email, contractor.password);
    browser.sleep(SECOND);
  });

  afterEach(() => {
    logout();
  });

  it('should display Messaging & Notifications cards titles', () => {
    userMenu.click();
    browser.sleep(SECOND);
    element(by.linkText(menuLinkText.messagingAndNotifications)).click();
    browser.sleep(SECOND);
    expect(element(by.css(".notification-settings-card .account-title")).getText()).toEqual(pageTitle.notificationSettings);
    expect(element(by.css(".quick-reply-card .account-title")).getText()).toEqual(pageTitle.autoReplay);
  });

});






