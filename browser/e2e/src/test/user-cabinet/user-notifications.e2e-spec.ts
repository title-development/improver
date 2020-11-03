import { users } from "../../../test.data";
import { clickBackdrop, login, logout } from "../../utils/common.functions";
import { browser, by, element } from "protractor";
import { SECOND } from "../../utils/constants";

describe('Notifications User', () => {

  let customer = users.customer;

  beforeEach(() => {

    login(customer.email, customer.password);
    browser.sleep(SECOND);
  });

  afterEach(() => {
    logout();
  });

  it('should display notifications title', () => {
    element(by.css(".notification-bar button")).click();
    browser.sleep(SECOND);
    expect(element(by.css("notifications-popup")).isPresent()).toEqual(true)
    clickBackdrop();
    browser.sleep(SECOND);
  });

});






