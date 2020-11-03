import { errorMessages, SECOND } from "../..//utils/constants";
import {
  findEditableInputErrorElementByName,
  findInputErrorElementByName,
  login,
  logout,
  validateEmailOnAccount,
  validateFirstLastNameInputs,
  validatePasswordAndConfirmPassword,
  validatePhoneInputs
} from "../../utils/common.functions";
import { browser, by, element } from "protractor";
import { users } from "../../../test.data";
import { userMenu } from "../../utils/util";

describe('Pro Account Page', () => {

  // User information form elements
  let personalInfoForm = element(by.css(".personal-info-form"));
  let emailEditableInput = element(by.css("cv-editable-input[name='email']"));

  let emailInput = emailEditableInput.element(by.css("input"));
  let emailInputErrorMessage = element(by.xpath(`//cv-editable-input[@name="email"]/ancestor::cv-input-field//cv-field-error/span`));
  let firstNameInput = personalInfoForm.element(by.name("firstName"));
  let lastNameInput = personalInfoForm.element(by.name("lastName"));
  let phoneInput = personalInfoForm.element(by.css("cv-editable-input[name=phone] input"));

  // Change password form elements
  let changePasswordForm = element(by.css(".change-password-form"));
  let oldPasswordInput = changePasswordForm.element(by.name("oldPassword"));
  let newPasswordInput = changePasswordForm.element(by.name("newPassword"));
  let confirmPasswordInput = changePasswordForm.element(by.name("confirmNewPassword"));


  beforeEach(() => {
    login(users.contractor.email, users.contractor.password);
    browser.sleep(SECOND);
    browser.get('/pro/settings/account');
    browser.sleep(SECOND);
  });

  afterEach(() => {
    logout();
  });

  it('should display account cards', () => {

    userMenu.click();
    browser.sleep(SECOND);
    element(by.partialLinkText('User Account')).click();
    browser.sleep(SECOND);

    expect(element(by.css(".personal-info-card h3")).getText()).toEqual("User information")
    expect(element(by.css(".social-connection h3")).getText()).toEqual("Login option")
  });

  it('should check email validation', () => {
    browser.sleep(SECOND);
    validateEmailOnAccount (emailInput, emailInputErrorMessage, errorMessages.emailError, users.customer.email);
   });

  it('should check first name validation', () => {
    firstNameInput.clear();
    element(by.css(".save-personal-info")).click();
    browser.sleep(SECOND);
    validateFirstLastNameInputs(firstNameInput, findInputErrorElementByName("firstName"), errorMessages.firstNameError, users.customer.firstName);
  });

  it('should check last name validation', () => {
    lastNameInput.clear();
    element(by.css(".save-personal-info")).click();
    browser.sleep(SECOND);
    validateFirstLastNameInputs(lastNameInput, findInputErrorElementByName("lastName"), errorMessages.lastNameError, users.customer.lastName);
  });

  // pattern for phone removed
  xit('should check phone number validation', () => {
    validatePhoneInputs(phoneInput, findEditableInputErrorElementByName("phone"), errorMessages.phoneError);
  });

  it('should check new password and confirm password', () => {
    element(by.css(".change-password-button")).click();
    browser.sleep(SECOND);
    element(by.css(".change-password-form .cv-button[type='submit']")).click();
    expect(findInputErrorElementByName("oldPassword").getText()).toEqual(errorMessages.passwordError.emptyField);
    // TODO: Errors replaced by password hint but its not visible after form submit
    // expect(findInputErrorElementByName("newPassword").getText()).toEqual(errorMessages.passwordError.emptyField);
    expect(findInputErrorElementByName("confirmNewPassword").getText()).toEqual(errorMessages.confirmPasswordError.emptyField);

    oldPasswordInput.sendKeys(users.customer.password);
    expect(findInputErrorElementByName("oldPassword").isPresent()).toBeFalsy();
    validatePasswordAndConfirmPassword(newPasswordInput, confirmPasswordInput, findInputErrorElementByName("newPassword"), findInputErrorElementByName("confirmNewPassword"), errorMessages.passwordError, errorMessages.confirmPasswordError);
    element(by.css("password-editor .close-modal")).click();
  });

});






