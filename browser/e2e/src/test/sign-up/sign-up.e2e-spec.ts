import { browser, by, element, promise, protractor } from 'protractor';
import { users } from "../../../test.data";
import { THREE_SECONDS } from "../../utils/util";

describe('Sign up', () => {

  beforeEach(() => {
    browser.get('/signup');
  });

  it('should display signup title', () => {
    expect(element(by.css("app-root .auth-form .auth-form-title")).getText()).toEqual("Sign up to hire Professionals");
  });

  let customer = users.newCustomer;

  it('should signup new Customer', () => {
    element(by.name("email")).sendKeys(customer.email);
    element(by.name("password")).sendKeys(customer.password);
    element(by.name("confirmPassword")).sendKeys(customer.password);
    element(by.name("firstName")).sendKeys(customer.firstName);
    element(by.name("lastName")).sendKeys(customer.lastName, protractor.Key.ENTER);
    browser.sleep(THREE_SECONDS);
    expect(element(by.css(".success-card .title")).getText()).toEqual("You’ve been successfully registered!");
  });

});
