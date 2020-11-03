import { users } from "../../../test.data";
import { clickBackdrop, login, logout } from "../../utils/common.functions";
import { browser, by, element } from "protractor";
import { SECOND } from "../../utils/constants";

describe('Notifications Pro', () => {

  let contractor = users.contractor;

  beforeEach(() => {
    login(contractor.email, contractor.password);
    browser.sleep(SECOND);
  });

  afterEach(() => {
    logout();
  });

  it('should display notifications popup', () => {
    element(by.css(".notification-bar button")).click();
    browser.sleep(SECOND);
    expect(element(by.css("notifications-popup")).isPresent()).toEqual(true)
    clickBackdrop();
    browser.sleep(SECOND);
  });

});






