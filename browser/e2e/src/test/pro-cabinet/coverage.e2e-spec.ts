import { users } from "../../../test.data";
import { login, logout } from "../../utils/common.functions";
import { browser, by, element } from "protractor";
import { menuLinkText, pageTitle, SECOND } from "../../utils/constants";

describe('Coverage Page', () => {

  let contractor = users.contractor;

  beforeEach(() => {
    login(contractor.email, contractor.password);
    browser.sleep(SECOND);
  });

  afterEach(() => {
    logout();
  });

  it('should display coverage hint and configuration title', () => {
    element(by.css(".header .user-name")).click()
    browser.sleep(SECOND);
    element(by.partialLinkText(menuLinkText.serviceArea)).click();
    browser.sleep(SECOND);
    let coverageHintConfirmButton = element(by.linkText('Got it'));
    expect(coverageHintConfirmButton.isPresent());
    coverageHintConfirmButton.click();
    browser.sleep(SECOND);
    expect(element(by.css("imp-coverage-configuration h4")).getText()).toEqual(pageTitle.serviceArea);
  });

});






