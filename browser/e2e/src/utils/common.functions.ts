import { $$, browser, by, element, protractor } from "protractor";
import { SECOND, THREE_SECONDS } from "./util";

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
