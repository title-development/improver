import { users } from "../../../test.data";
import { login, logout } from "../../utils/common.functions";
import { browser, by, element } from "protractor";
import { SECOND } from "../../utils/constants";

describe('Company Info Page', () => {

  let contractor = users.contractor;

  beforeEach(() => {
    login(contractor.email, contractor.password);
    browser.sleep(SECOND);
  });

  afterEach(() => {
    logout();
  });

  it('should display company profile main chapters', () => {
    element(by.css(".header .user-name")).click()
    browser.sleep(SECOND);
    element(by.partialLinkText("Company Profile")).click();
    browser.sleep(SECOND);
    let infoGroupHeaders = element.all(by.css(".details-list .info-group h4"));

    expect(infoGroupHeaders.get(0).getText()).toEqual("About");
    expect(infoGroupHeaders.get(1).getText()).toEqual("Licenses");
    expect(infoGroupHeaders.get(2).getText()).toEqual("Services offered");
  });

});






