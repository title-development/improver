import { browser, by, element, promise, protractor } from 'protractor';
import {
  letter,
  notAllowedNameSymbols,
  notValidEmails,
  notValidPasswords,
  users,
  validConfirmPassword,
  validNames,
  validPasswords, zero, tooShortPassword
} from "../../../test.data";
import { FIVE_SECONDS, SECOND, THREE_SECONDS } from "../../utils/util";
import {
  findInputErrorElementByName,
  validateEmailInputs,
  validateFirstLastNameInputs, validatePasswordAndConfirmPassword, validateRegisteredEmail
} from "../../utils/common.functions";
import { successTitle, pageTitle, errorMessages } from "../../utils/constants";
describe('Sign up', () => {

  let customer = users.newCustomer;

  let authForm = element(by.css(".auth-form"));
  let emailInput = authForm.element(by.name("email"));
  let passwordInput = authForm.element(by.name("password"));
  let confirmPasswordInput = authForm.element(by.name("confirmPassword"));
  let firstNameInput = authForm.element(by.name("firstName"));
  let lastNameInput = authForm.element(by.name("lastName"));
  function clickSubmit() {
    element(by.css('[type="submit"]')).click();
    browser.sleep(SECOND);
  }

  beforeEach(() => {
    browser.get('/signup');
    browser.sleep(SECOND);
  });

  it('should display signup title', () => {
    expect(element(by.css("app-root .auth-form .auth-form-title")).getText()).toEqual(pageTitle.signUp);
  });

  it('should signup new Customer', () => {
    emailInput.sendKeys(customer.email);
    passwordInput.sendKeys(customer.password);
    confirmPasswordInput.sendKeys(customer.password);
    firstNameInput.sendKeys(customer.firstName);
    lastNameInput.sendKeys(customer.lastName);
    clickSubmit();
    browser.sleep(FIVE_SECONDS);
    expect(element(by.css(".success-card .title")).getText()).toEqual(successTitle.registeredUser);
  });

  it('should check email validation', () => {
    clickSubmit();
    validateEmailInputs(emailInput, findInputErrorElementByName("email"), errorMessages.emailError);
    validateRegisteredEmail(emailInput, findInputErrorElementByName("email"), errorMessages.emailError, users.customer.email);
  });

 it('should check password and confirm password', () => {
   clickSubmit();
   expect(findInputErrorElementByName("password").getText()).toEqual(errorMessages.passwordError.emptyField);
   expect(findInputErrorElementByName("confirmPassword").getText()).toEqual(errorMessages.confirmPasswordError.emptyField);
   validatePasswordAndConfirmPassword(passwordInput, confirmPasswordInput, findInputErrorElementByName("password"), findInputErrorElementByName("confirmPassword"), errorMessages.passwordError, errorMessages.confirmPasswordError);
  });

  it('should check first name validation', () => {
    clickSubmit();
    validateFirstLastNameInputs(firstNameInput, findInputErrorElementByName("firstName"), errorMessages.firstNameError, users.customer.firstName);
  });

  it('should check last name validation', () => {
    clickSubmit();
    validateFirstLastNameInputs(lastNameInput, findInputErrorElementByName("lastName"), errorMessages.lastNameError, users.customer.lastName);
  });
});
