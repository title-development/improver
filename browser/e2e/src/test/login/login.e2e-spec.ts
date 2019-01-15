import { browser, by, element, promise, protractor } from 'protractor';
import { users } from "../../../test.data";
import { login, logout } from "../../utils/common.functions";
import { WRONG_EMAIL_PASSWORD_MESSAGE } from "../../utils/util";

describe('Login Page', () => {

  let customer = users.customer;

  beforeEach(() => {
    browser.get('/');
  });

  afterEach(() => {
    logout();
  });

  it('should display login title', () => {
    browser.get('/login');
    expect(element(by.css("app-root .auth-form .auth-form-title")).getText()).toEqual("Log in to Home Improve");
  });

  it('should not login existing Customer with wrong password', () => {
    let invalidPassword = customer.password + "123abc";
    login(customer.email, invalidPassword);
    // TODO: Taras fix it
    let errorMessageElement = element(by.css(".auth-form .response-message.error .text"));
    errorMessageElement.isPresent();
    expect(errorMessageElement.getText()).toEqual(WRONG_EMAIL_PASSWORD_MESSAGE);
  });

  it('should login existed Customer', () => {
    login(customer.email, customer.password);
    expect(element(by.css(".header .user-name")).getText()).toEqual(customer.firstName + " " + customer.lastName);
  });

  let notRegisteredCustomer = users.notRegisteredCustomer;

  it('should not login not existed Customer', () => {
    login(notRegisteredCustomer.email, notRegisteredCustomer.password);
    let errorMessageElement = element(by.css(".auth-form .response-message.error .text"));
    errorMessageElement.isPresent();
    expect(errorMessageElement.getText()).toEqual(WRONG_EMAIL_PASSWORD_MESSAGE);
  });

});
