import { browser, by, element, promise, protractor } from 'protractor';
import {
  users,
  partlyValidLocation,
  notAllowedNameSymbols,
  validNames,
  notValidEmails,
  notValidPasswords,
  validConfirmPassword,
  validPasswords,
  notValidPhones,
  zero, letter, tooShortPassword
} from "../../../test.data";
import { FIVE_SECONDS, SECOND, THREE_SECONDS } from "../../utils/util";
import { errorMessages, signUpProHints, successTitle } from "../../utils/constants";
import {
  findInputErrorElementByName,
  login,
  validateEmailInputs,
  validateFirstLastNameInputs, validatePasswordAndConfirmPassword, validatePhoneInputs, validateRegisteredEmail
} from "../../utils/common.functions";

describe('Sign up Pro', () => {

  let authForm = element(by.css(".account-form"));
  let firstNameInput = authForm.element(by.name("firstName"));
  let lastNameInput = authForm.element(by.name("lastName"));
  let emailInput = authForm.element(by.name("email"));
  let phoneInput = authForm.element(by.name("phone"));
  let passwordInput = authForm.element(by.name("password"));
  let confirmPasswordInput = authForm.element(by.name("confirmPassword"));
  function checkPrivacyPolicyAndSubmit() {
    element(by.css(".account-form .agree .checkbox-icon")).click();
    browser.sleep(SECOND);
    element(by.css(".button-next")).click();
    browser.sleep(SECOND);
  }

  beforeEach(() => {
    browser.get('/signup-pro');
    browser.sleep(SECOND);
  });

  it('should check first name validation', () => {
    checkPrivacyPolicyAndSubmit();
    validateFirstLastNameInputs(firstNameInput, findInputErrorElementByName("firstName"), errorMessages.firstNameError, users.customer.firstName);
  });

  it('should check last name validation', () => {
    checkPrivacyPolicyAndSubmit();
    validateFirstLastNameInputs(lastNameInput, findInputErrorElementByName("lastName"), errorMessages.lastNameError, users.customer.lastName);
  });

  it('should check email validation', () => {
    checkPrivacyPolicyAndSubmit();
    validateEmailInputs(emailInput, findInputErrorElementByName("email"), errorMessages.emailError);
    validateRegisteredEmail(emailInput, findInputErrorElementByName("email"), errorMessages.emailError, users.customer.email);
  });

  it('should check phone number validation', () => {
    checkPrivacyPolicyAndSubmit();
    expect(findInputErrorElementByName("phone").getText()).toEqual(errorMessages.phoneError.emptyField);
    validatePhoneInputs(phoneInput, findInputErrorElementByName("phone"), errorMessages.phoneError);
  });

  it('should check password and confirm password', () => {
    checkPrivacyPolicyAndSubmit();
    expect(findInputErrorElementByName("password").getText()).toEqual(errorMessages.passwordError.emptyField);
    expect(findInputErrorElementByName("confirmPassword").getText()).toEqual(errorMessages.confirmPasswordError.emptyField);
    validatePasswordAndConfirmPassword(passwordInput, confirmPasswordInput, findInputErrorElementByName("password"), findInputErrorElementByName("confirmPassword"), errorMessages.passwordError, errorMessages.confirmPasswordError);
    browser.sleep(SECOND);

  });

  //TODO: Should be changed according to Facebook and Google registration
  xit('should signup new Contractor', () => {

    // Step 1
    expect(element(by.css('.hint')).getText()).toEqual(signUpProHints.email);
    firstNameInput.sendKeys(users.newContractor.firstName);
    lastNameInput.sendKeys(users.newContractor.lastName);
    emailInput.sendKeys(users.newContractor.email);
    phoneInput.sendKeys(users.newContractor.phone);
    passwordInput.sendKeys(users.newContractor.password);
    confirmPasswordInput.sendKeys(users.newContractor.password);
    checkPrivacyPolicyAndSubmit();

    // Step 2
    expect(element(by.css('.hint')).getText()).toEqual(signUpProHints.companyLogo);
    element(by.name("name")).sendKeys(users.newContractor.company.name);
    element(by.name("description")).sendKeys(users.newContractor.company.description);
    element(by.name("address")).sendKeys(partlyValidLocation.streetAddress);
    element(by.name("city")).sendKeys(partlyValidLocation.city);
    element(by.name("state")).element(by.tagName("input")).sendKeys(partlyValidLocation.state);
    browser.sleep(SECOND);
    element(by.name("state")).element(by.tagName("input")).sendKeys(protractor.Key.TAB);
    element(by.name("zip")).sendKeys(partlyValidLocation.zip);
    browser.sleep(SECOND);
    expect(element(by.css(".icon .edit")).isEnabled()).toBe(true);
    element(by.css(".button-next")).click();
    browser.sleep(THREE_SECONDS);
    // Address validation
    element.all(by.css(".mat-dialog-container .content > .row > div")).get(1).element(by.tagName("button")).click();

    // Step 3
    browser.waitForAngularEnabled(false);
    browser.sleep(SECOND);
    expect(element(by.css('.description-block')).getText()).toEqual(signUpProHints.coverageCommon);
    expect(element(by.css('.hint')).getText()).toEqual(signUpProHints.coverageRadius);
    element(by.css(".button-next")).click();
    browser.sleep(SECOND);

    // Step 4
    expect(element(by.css('.description-block')).getText()).toEqual(signUpProHints.offeredServices);
    expect(element(by.css('.hint')).getText()).toEqual(signUpProHints.businessCategories);
    element(by.name("addingItem")).element(by.tagName("input")).sendKeys("Appliance");
    browser.sleep(SECOND);
    element(by.name("addingItem")).element(by.tagName("input")).sendKeys(protractor.Key.ENTER);
    browser.sleep(SECOND);
    element(by.css(".add-service-button")).click();
    browser.sleep(SECOND);
    expect(element(by.css('.content .hint')).getText()).toEqual(signUpProHints.checkService);
    element(by.css(".button-next")).click();
    browser.sleep(FIVE_SECONDS);
    expect(element(by.css(".success-card .title")).getText()).toEqual(successTitle.registeredUser);
    browser.waitForAngularEnabled(true);
    browser.sleep(FIVE_SECONDS);
  });
});
