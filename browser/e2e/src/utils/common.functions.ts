import { browser, by, element, protractor } from "protractor";
import {
  letter,
  notAllowedNameSymbols,
  notValidEmails,
  notValidPasswords,
  notValidPhones,
  tooShortPassword,
  validConfirmPassword,
  validNames,
  validPasswords,
  zero
} from "../../test.data";
import { phoneValidationCode, SECOND, THREE_SECONDS } from "./constants";
import { userMenu } from "./util";

export function clearStorage() {
  function clearStorage() {
    window.sessionStorage.clear();
    window.localStorage.clear();
  }

  browser.executeScript(clearStorage);
}

export function login(email: string, password: string) {
  browser.sleep(THREE_SECONDS);
  // TODO: Error if redirect by clicking in menu without refresh http://git.io/v4gXM
  browser.get('/login');
  element(by.name("email")).sendKeys(email);
  element(by.name("password")).sendKeys(password, protractor.Key.ENTER);
}

export function logout() {
  logoutUI();
}

/**
 * Logout user by clicking on logout button in user menu. Skipping any actions if user is not authorized.
 */
export function logoutUI() {
  userMenu.isPresent().then(value => {
    if (value) {
      userMenu.click();
      browser.sleep(SECOND);
      element(by.css(".header .menu-footer a")).click();
      browser.sleep(SECOND);
    }
  });
}

export function confirmEmailConfirmationHintDialog() {
  element(by.css("email-verification-hint-dialog .confirm")).click()
}

export function closeNotificationPopup() {
  element(by.css(".pop-up-message .close-button-wrapper mat-icon")).click()
}

export function sendKeysByOne(element, value) {
  value = value.toString();
  for (let i = 0; i < value.length; i++) {
    element.sendKeys(value.charAt(i));
  }
}

export function findInputErrorElementByName(name) {
  return element(by.xpath(`//input[@name="${name}"]/ancestor::cv-input-field//cv-field-error/span`));
}

export function findEditableInputErrorElementByName(name) {
  return element(by.xpath(`//input/ancestor::cv-editable-input[@name="${name}"]//cv-field-error/span`));
}

export function validateFirstLastNameInputs(inputFirstLastNameElement, errorFirstLastNameElement, firstLastNameErrorMessage, firstLastName) {

  expect(errorFirstLastNameElement.getText()).toEqual(firstLastNameErrorMessage.emptyField);

   notAllowedNameSymbols.forEach(symbol => {
    inputFirstLastNameElement.sendKeys(firstLastName + symbol);
    expect(errorFirstLastNameElement.getText()).toEqual(firstLastNameErrorMessage.notValid);
    inputFirstLastNameElement.clear();
  });

  inputFirstLastNameElement.sendKeys(zero + firstLastName);
  expect(errorFirstLastNameElement.getText()).toEqual(firstLastNameErrorMessage.notValid);
  inputFirstLastNameElement.clear();

  inputFirstLastNameElement.sendKeys(letter);
  expect(errorFirstLastNameElement.getText()).toEqual(firstLastNameErrorMessage.tooShort);
  inputFirstLastNameElement.clear();

  validNames.forEach(symbol => {
    inputFirstLastNameElement.sendKeys(firstLastName + symbol);
    expect(errorFirstLastNameElement.isPresent()).toBeFalsy();
    inputFirstLastNameElement.clear();
  });
}

export function validateEmailInputs (inputEmailElement, errorEmailElement, emailErrorMessage) {

  expect(errorEmailElement.getText()).toEqual(emailErrorMessage.emptyField);
  browser.sleep(SECOND);

  notValidEmails.forEach(notValidEmail => {
    inputEmailElement.sendKeys(notValidEmail);
    expect(errorEmailElement.getText()).toEqual(emailErrorMessage.notValid);
    inputEmailElement.clear();
  });
}

export function validateEmailOnAccount (inputEmailElementOnAccount, errorEmailElementOnAccount, emailErrorMessageOnAccount, userEmail) {
  element(by.css("cv-editable-input[name='email'] .-edit")).click();
  browser.sleep(SECOND);
  inputEmailElementOnAccount.clear();

  inputEmailElementOnAccount.sendKeys(userEmail);
  browser.sleep(SECOND);
  element(by.css("cv-editable-input[name='email'] .-save")).click();
  browser.sleep(SECOND);
  expect(errorEmailElementOnAccount.getText()).toEqual(emailErrorMessageOnAccount.emailRegistered);
  inputEmailElementOnAccount.clear();
  element(by.css("cv-editable-input[name='email'] .-save")).click();
  browser.sleep(SECOND);

  notValidEmails.forEach(notValidEmail => {
    inputEmailElementOnAccount.sendKeys(notValidEmail);
    element(by.css("cv-editable-input[name='email'] .-save")).click();
    expect(errorEmailElementOnAccount.getText()).toEqual(emailErrorMessageOnAccount.notValid);
    inputEmailElementOnAccount.clear();
  });

  element(by.css("cv-editable-input[name='email'] .-save")).click();
  expect(errorEmailElementOnAccount.getText()).toEqual(emailErrorMessageOnAccount.emptyField);
}

export function validateRegisteredEmail (inputEmailElement, errorEmailElement, emailErrorMessage, registeredUserEmail){
  inputEmailElement.sendKeys(registeredUserEmail);
  browser.sleep(SECOND);
  expect(errorEmailElement.getText()).toEqual(emailErrorMessage.emailRegistered);
  inputEmailElement.clear();
}

export function validatePhoneInputs (inputPhoneElement, errorPhoneElement, phoneErrorMessage) {
  element(by.css("cv-editable-input[name='phone'] .-edit")).click();
  browser.sleep(SECOND);

  inputPhoneElement.clear();

  notValidPhones.forEach(notValidPhone => {
    inputPhoneElement.sendKeys(notValidPhone);
    expect(errorPhoneElement.getText()).toEqual(phoneErrorMessage.notValid);
    inputPhoneElement.clear();
  });
}

export function validatePasswordAndConfirmPassword(inputPasswordElement, inputConfirmPasswordElement, errorPasswordElement, errorConfirmPasswordElement, passwordErrorMessage, confirmPasswordErrorMessage) {

  let passwordHint = element(by.css("cv-password-hint .cv-password-hint"))

  notValidPasswords.forEach(notValidPassword => {
    inputPasswordElement.sendKeys(notValidPassword, protractor.Key.TAB);
    browser.sleep(SECOND);
    expect(passwordHint.getCssValue("opacity")).toEqual("1");
    inputPasswordElement.clear();
  });

  inputPasswordElement.sendKeys(tooShortPassword, protractor.Key.TAB);
  browser.sleep(SECOND);
  expect(passwordHint.getCssValue("opacity")).toEqual("1");
  inputPasswordElement.clear();

  validPasswords.forEach(validPassword => {
    inputPasswordElement.sendKeys(validPassword, protractor.Key.TAB);
    browser.sleep(SECOND);
    expect(passwordHint.getCssValue("opacity")).toEqual("0");
    inputPasswordElement.clear();
  });

  inputConfirmPasswordElement.sendKeys(validConfirmPassword);
  expect(errorConfirmPasswordElement.getText()).toEqual(confirmPasswordErrorMessage.passwordMismatch);
  inputPasswordElement.clear();
  inputConfirmPasswordElement.clear();

//input valid, but different passwords in fields
  inputPasswordElement.sendKeys(validPasswords[0], protractor.Key.TAB);
  inputConfirmPasswordElement.sendKeys(validConfirmPassword);
  browser.sleep(SECOND);
  expect(passwordHint.getCssValue("opacity")).toEqual("0");
  expect(errorConfirmPasswordElement.getText()).toEqual(confirmPasswordErrorMessage.passwordMismatch);
  inputPasswordElement.clear();
  inputConfirmPasswordElement.clear();
  browser.sleep(SECOND);
}

export function clickBackdrop() {
  element(by.css(".backdrop")).click();
}

export function insertPhoneValidationCode(code = phoneValidationCode) {
  element(by.name("code")).sendKeys(code)
}
