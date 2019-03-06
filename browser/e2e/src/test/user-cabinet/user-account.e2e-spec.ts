import {
  letter,
  notAllowedNameSymbols,
  notValidEmails,
  notValidPasswords,
  notValidPhones, tooShortPassword,
  users, validConfirmPassword,
  validNames, validPasswords, zero
} from "../../../test.data";
import {
  findInputErrorElementByName,
  login,
  logout, validateEmailOnAccount,
  validateFirstLastNameInputs, validatePasswordAndConfirmPassword,
  validatePhoneInputs
} from "../../utils/common.functions";
import { $$, browser, by, element, protractor } from "protractor";
import { FIVE_SECONDS, SECOND, THREE_SECONDS } from "../../utils/util";
import { errorMessages, pageTitle } from "../../utils/constants";

describe('User Account Page', () => {

  // User information form elements
  let personalInfoForm = element(by.css(".personal-info-form"));
  let emailEditableInput = element(by.css("cv-editable-input[name='email']"));

  let emailInput = emailEditableInput.element(by.css("input"));
  let emailInputErrorMessage = element(by.xpath(`//cv-editable-input[@name="email"]/ancestor::cv-input-field//cv-field-error/span`));
  let firstNameInput = personalInfoForm.element(by.name("firstName"));
  let lastNameInput = personalInfoForm.element(by.name("lastName"));
  let phoneInput = personalInfoForm.element(by.name("phone"));

  // Change password form elements
  let changePasswordForm = element(by.css(".change-password-form-group"));
  let oldPasswordInput = changePasswordForm.element(by.name("oldPassword"));
  let newPasswordInput = changePasswordForm.element(by.name("newPassword"));
  let confirmPasswordInput = changePasswordForm.element(by.name("confirmNewPassword"));

  beforeEach(() => {

    login(users.customer.email, users.customer.password);
    browser.sleep(SECOND);
    browser.get('/my/settings/account');
    browser.sleep(SECOND);
  });

  afterEach(() => {
    logout();
  });

  it('should display account title', () => {
    browser.waitForAngularEnabled(false);
    let userMenu = element(by.css(".header .user-name"));
    userMenu.isPresent().then(value => {
      if (value) {
        userMenu.click();
        browser.sleep(SECOND);
        element(by.linkText('Account')).click();
        browser.sleep(SECOND);
      }
    });
    expect(element(by.css(".account-nav-title")).getText()).toEqual(pageTitle.account);
  });

  it('should check email validation', () => {
    browser.waitForAngularEnabled(false);
    browser.sleep(SECOND);

    validateEmailOnAccount (emailInput, emailInputErrorMessage, errorMessages.emailError, users.contractor.email);
  });

  it('should check first name validation', () => {

    browser.waitForAngularEnabled(false);
    firstNameInput.clear();
    element(by.css(".save-personal-info")).click();
    browser.sleep(SECOND);

    validateFirstLastNameInputs(firstNameInput, findInputErrorElementByName("firstName"), errorMessages.firstNameError, users.customer.firstName)
  });

  it('should check last name validation', () => {
    browser.waitForAngularEnabled(false);
    lastNameInput.clear();
    element(by.css(".save-personal-info")).click();
    browser.sleep(SECOND);

    validateFirstLastNameInputs(lastNameInput, findInputErrorElementByName("lastName"), errorMessages.lastNameError, users.customer.lastName)
  });

  it('should check phone number validation', () => {
    browser.waitForAngularEnabled(false);
    browser.sleep(SECOND);
    validatePhoneInputs(phoneInput, findInputErrorElementByName("phone"), errorMessages.phoneError);
  });

  it('should check new password and confirm password', () => {
    browser.waitForAngularEnabled(false);
    browser.sleep(SECOND);

    element(by.css(".change-password-card .cv-button")).click();

    expect(findInputErrorElementByName("oldPassword").getText()).toEqual(errorMessages.passwordError.emptyField);
    expect(findInputErrorElementByName("newPassword").getText()).toEqual(errorMessages.passwordError.emptyField);
    expect(findInputErrorElementByName("confirmNewPassword").getText()).toEqual(errorMessages.confirmPasswordError.emptyField);

    oldPasswordInput.sendKeys(users.customer.password);
    expect(findInputErrorElementByName("oldPassword").isPresent()).toBeFalsy();
    validatePasswordAndConfirmPassword(newPasswordInput, confirmPasswordInput, findInputErrorElementByName("newPassword"), findInputErrorElementByName("confirmNewPassword"), errorMessages.passwordError, errorMessages.confirmPasswordError);
  });
});






