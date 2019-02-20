import { $$, browser, by, element, protractor } from "protractor";
import { SECOND, TEN_SECONDS, THREE_SECONDS } from "./util";
import {
  letter,
  notAllowedNameSymbols,
  zero,
  validNames,
  notValidEmails,
  users,
  notValidPhones, notValidPasswords, tooShortPassword, validPasswords, validConfirmPassword
} from "../../test.data";
import { errorMessages } from "./constants";

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
  // $$('a[href="/login"]').filter(item => item.isDisplayed()).first().click();
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
  let userMenu = element(by.css(".header .user-name"));
  userMenu.isPresent().then(value => {
    if (value) {
      userMenu.click();
      browser.sleep(SECOND);
      element(by.css(".header .menu-footer")).click();
      browser.sleep(SECOND);
    }
  });
}

export function sendKeysByOne(element, value) {
  value = value.toString();
  for (let i = 0; i < value.length; i++) {
    element.sendKeys(value.charAt(i));
  }
}

export function findInputErrorElementByName(name) {
  return element(by.xpath(`//input[@name="${name}"]/ancestor::cv-input-field/cv-field-error/span`));
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
  inputPhoneElement.clear();

  notValidPhones.forEach(notValidPhone => {
    inputPhoneElement.sendKeys(notValidPhone);
    expect(errorPhoneElement.getText()).toEqual(phoneErrorMessage.notValid);
    inputPhoneElement.clear();
  });
}

export function validatePasswordAndConfirmPassword (inputPasswordElement, inputConfirmPasswordElement, errorPasswordElement, errorConfirmPasswordElement, passwordErrorMessage, confirmPasswordErrorMessage) {

notValidPasswords.forEach(notValidPassword => {
  inputPasswordElement.sendKeys(notValidPassword);
  expect(errorPasswordElement.getText()).toEqual(passwordErrorMessage.notValid);
  inputPasswordElement.clear();
});

  inputPasswordElement.sendKeys(tooShortPassword);
expect(errorPasswordElement.getText()).toEqual(passwordErrorMessage.tooShort);
  inputPasswordElement.clear();

validPasswords.forEach(validPassword => {
  inputPasswordElement.sendKeys(validPassword);
  expect(errorPasswordElement.isPresent()).toBeFalsy();
  inputPasswordElement.clear();
});

  inputConfirmPasswordElement.sendKeys(validConfirmPassword);
  expect(errorConfirmPasswordElement.getText()).toEqual(confirmPasswordErrorMessage.passwordMismatch);
  inputPasswordElement.clear();
  inputConfirmPasswordElement.clear();

//input valid, but different passwords in fields
  inputPasswordElement.sendKeys(validPasswords[0]);
  inputConfirmPasswordElement.sendKeys(validConfirmPassword);
expect(errorPasswordElement.isPresent()).toBeFalsy();
expect(errorConfirmPasswordElement.getText()).toEqual(confirmPasswordErrorMessage.passwordMismatch);
  inputPasswordElement.clear();
  inputConfirmPasswordElement.clear();


}
