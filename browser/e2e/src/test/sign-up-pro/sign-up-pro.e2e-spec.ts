import { browser, by, element, promise, protractor } from 'protractor';
import { users } from "../../../test.data";
import { FIVE_SECONDS, SECOND, THREE_SECONDS } from "../../utils/util";

describe('Sign up Pro', () => {

  browser.get('/');

  let contractor = users.newContractor;

  it('should signup new Contractor', () => {
    browser.get('/signup-pro');
    browser.sleep(SECOND);
    // Step 1
    let authForm = element(by.css(".account-form"));
    authForm.element(by.name("firstName")).sendKeys(contractor.firstName);
    authForm.element(by.name("lastName")).sendKeys(contractor.lastName);
    authForm.element(by.name("email")).sendKeys(contractor.email);
    authForm.element(by.name("phone")).sendKeys(contractor.phone);
    authForm.element(by.name("password")).sendKeys(contractor.password);
    authForm.element(by.name("confirmPassword")).sendKeys(contractor.password);
    browser.sleep(SECOND);
    authForm.element(by.css(".agree .checkbox-icon")).click();
    browser.sleep(SECOND);
    element(by.css(".button-next")).click();
    browser.sleep(SECOND);

    // Step 2
    element(by.name("companyName")).sendKeys(contractor.companyName);
    element(by.name("companyDescription")).sendKeys(contractor.companyDescription);
    element(by.name("address")).sendKeys(contractor.streetAddress);
    element(by.name("city")).sendKeys(contractor.city);
    element(by.name("state")).element(by.tagName("input")).sendKeys(contractor.state);
    browser.sleep(SECOND);
    element(by.name("state")).element(by.tagName("input")).sendKeys(protractor.Key.TAB);
    element(by.name("zip")).sendKeys(contractor.zip);
    browser.sleep(SECOND);
    element(by.css(".button-next")).click();
    browser.sleep(THREE_SECONDS);
    // Address validation
    element.all(by.css(".mat-dialog-container .content > .row > div")).get(1).element(by.tagName("button")).click();

    // Step 3
    browser.waitForAngularEnabled(false);
    browser.sleep(SECOND);
    element(by.css(".button-next")).click();
    browser.sleep(SECOND);

    // Step 4
    element(by.name("addingItem")).element(by.tagName("input")).sendKeys("Appliance");
    browser.sleep(SECOND);
    element(by.name("addingItem")).element(by.tagName("input")).sendKeys(protractor.Key.ENTER);
    browser.sleep(SECOND);
    element(by.css(".add-service-button")).click();
    browser.sleep(SECOND);
    element(by.css(".button-next")).click();
    browser.sleep(FIVE_SECONDS);
    expect(element(by.css(".success-card .title")).getText()).toEqual("You’ve been successfully registered!");
    browser.waitForAngularEnabled(true);
    browser.sleep(FIVE_SECONDS);
  });

});
