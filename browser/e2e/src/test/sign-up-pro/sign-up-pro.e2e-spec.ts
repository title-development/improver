import { browser, by, element, protractor } from 'protractor';
import { partlyValidLocation, users } from "../../../test.data";
import {
  errorMessages,
  FIVE_SECONDS,
  SECOND,
  signUpProHints,
  successTitle,
  THREE_SECONDS
} from "../../utils/constants";
import {
  findInputErrorElementByName,
  insertPhoneValidationCode,
  logout,
  validateEmailInputs,
  validateFirstLastNameInputs,
  validatePasswordAndConfirmPassword,
  validatePhoneInputs,
  validateRegisteredEmail
} from "../../utils/common.functions";

describe('Sign up Pro', () => {

  let accountForm = element(by.css(".account-form"));
  let firstNameInput = accountForm.element(by.name("firstName"));
  let lastNameInput = accountForm.element(by.name("lastName"));
  let emailInput = accountForm.element(by.css("cv-input-field input[name='email']"));
  let phoneInput = accountForm.element(by.name("phone"));
  let passwordInput = accountForm.element(by.name("password"));
  let confirmPasswordInput = accountForm.element(by.name("confirmPassword"));
  let buttonNext = element(by.css(".button-next"))

  function clickSubmit() {
    element(by.css(".button-next")).click();
    browser.sleep(SECOND);
  }

  beforeEach(() => {
    browser.get('/signup-pro');
    browser.sleep(SECOND);
  });

  afterEach(() => {
    logout();
  });

  it('should check first name validation', () => {
    clickSubmit();
    validateFirstLastNameInputs(firstNameInput, findInputErrorElementByName("firstName"), errorMessages.firstNameError, users.customer.firstName);
  });

  it('should check last name validation', () => {
    clickSubmit();
    validateFirstLastNameInputs(lastNameInput, findInputErrorElementByName("lastName"), errorMessages.lastNameError, users.customer.lastName);
  });

  it('should check email validation', () => {
    clickSubmit();
    validateEmailInputs(emailInput, findInputErrorElementByName("email"), errorMessages.emailError);
    validateRegisteredEmail(emailInput, findInputErrorElementByName("email"), errorMessages.emailError, users.customer.email);
  });

  // pattern for phone removed
  xit('should check phone number validation', () => {
    clickSubmit();
    expect(findInputErrorElementByName("phone").getText()).toEqual(errorMessages.phoneError.emptyField);
    validatePhoneInputs(phoneInput, findInputErrorElementByName("phone"), errorMessages.phoneError);
  });

  it('should check password and confirm password', () => {
    clickSubmit();
    // TODO: Errors replaced by password hint but its not visible after form submit
    // expect(findInputErrorElementByName("password").getText()).toEqual(errorMessages.passwordError.emptyField);
    expect(findInputErrorElementByName("confirmPassword").getText()).toEqual(errorMessages.confirmPasswordError.emptyField);
    validatePasswordAndConfirmPassword(passwordInput, confirmPasswordInput, findInputErrorElementByName("password"), findInputErrorElementByName("confirmPassword"), errorMessages.passwordError, errorMessages.confirmPasswordError);
    browser.sleep(SECOND);

  });

  it('should signup new Contractor', () => {

    // Step 1
    expect(element(by.css('.step.-one .hint')).getText()).toEqual(signUpProHints.email);
    firstNameInput.sendKeys(users.newContractor.firstName);
    lastNameInput.sendKeys(users.newContractor.lastName);
    emailInput.sendKeys(users.newContractor.email);
    phoneInput.sendKeys(users.newContractor.phone);
    passwordInput.sendKeys(users.newContractor.password);
    confirmPasswordInput.sendKeys(users.newContractor.password);
    browser.sleep(SECOND);
    buttonNext.click();
    browser.sleep(THREE_SECONDS);
    insertPhoneValidationCode();
    browser.sleep(THREE_SECONDS);

    // Step 2
    expect(element(by.css('.step.-two .hint')).getText()).toEqual(signUpProHints.companyLogo);
    element(by.name("companyName")).sendKeys(users.newContractor.company.name);
    element(by.name("companyDescription")).sendKeys(users.newContractor.company.description);
    element(by.name("address")).sendKeys(partlyValidLocation.streetAddress);
    element(by.name("city")).sendKeys(partlyValidLocation.city);
    element(by.name("state")).element(by.tagName("input")).sendKeys(partlyValidLocation.state);
    browser.sleep(SECOND);
    element(by.name("state")).element(by.tagName("input")).sendKeys(protractor.Key.TAB);
    element(by.name("zip")).sendKeys(partlyValidLocation.zip);
    browser.sleep(SECOND);
    expect(element(by.css(".icon .edit")).isEnabled()).toBe(true);
    buttonNext.click();
    browser.sleep(THREE_SECONDS);
    // Address validation
    element.all(by.css(".mat-dialog-container .content > .row > div")).get(1).element(by.tagName("button")).click();

    // Step 3
    browser.sleep(SECOND);
    expect(element(by.css('.description-block')).getText()).toEqual(signUpProHints.coverageCommon);
    expect(element(by.css('.step.-three .hint')).getText()).toEqual(signUpProHints.coverageRadius);
    buttonNext.click();
    browser.sleep(SECOND);

    // Step 4
    expect(element(by.css('.description-block')).getText()).toEqual(signUpProHints.offeredServices);
    expect(element(by.css('.step.-four .hint')).getText()).toEqual(signUpProHints.businessCategories);
    element(by.name("addingItem")).element(by.tagName("input")).sendKeys("Appliance");
    browser.sleep(SECOND);
    element(by.name("addingItem")).element(by.tagName("input")).sendKeys(protractor.Key.ENTER);
    browser.sleep(SECOND);
    expect(element(by.css('.content .hint')).getText()).toEqual(signUpProHints.checkService);
    buttonNext.click();
    browser.sleep(FIVE_SECONDS);
    expect(element(by.css("email-verification-hint-card .explanation span")).getText()).toEqual(successTitle.registeredUser);
    browser.sleep(FIVE_SECONDS);

  });

});
