import { browser, by, element, protractor } from "protractor";
import { SECOND } from "./util";

export class QuestionaryHelper {

  constructor() {

  }

  public next() {
    element(by.css(".questionary-form .questionary-next-button")).click();
  }

  public radio(index) {
    element.all((by.css(".questionary-form .cv-radio-group .input-holder .cv-radio .radio-circle"))).get(index).click();
    this.next();
  }

  public radioImage(index) {
    element.all((by.css(".questionary-form .input-holder ul li"))).get(index).click();
    this.next();
  }

  public checkbox(...indexes) {
    element.all((by.css(".questionary-form .cv-checkbox-group cv-checkbox"))).each((element, index) => {
      if (indexes.includes(index)) element.click();
    });
    this.next();
  }

  public checkboxImage(...indexes) {
    element.all((by.css(".questionary-form .cv-checkbox-group ul li"))).each((element, index) => {
      if (indexes.includes(index)) element.click();
    });
    this.next();
  }

  public inputNumeric(value: number) {
    let input = element(by.css(".questionary-form .cv-input"));
    input.sendKeys(value.toString());
    this.next();
  }

  public textarea(notes: string) {
    element(by.css(".questionary-form .cv-input")).sendKeys(notes);
    this.next();
  }

  public address(streetAddress: string, city: string, state: string, zip: string) {
    element(by.name("streetAddress")).sendKeys(
      streetAddress, protractor.Key.TAB,
      city, protractor.Key.TAB,
      state);
    browser.sleep(SECOND);
    browser.actions().sendKeys(protractor.Key.ENTER, protractor.Key.TAB, zip).perform();
    browser.sleep(SECOND);
    this.next();
  }

  public addressApplySuggested() {
    element(by.css(".address.apply")).click();
  }

  public personalInfo(firstName: string, lastName: string, email: string, phoneNumber: string) {
    element(by.name("firstName")).sendKeys(
      firstName, protractor.Key.TAB,
      lastName, protractor.Key.TAB,
      email, protractor.Key.TAB,
      phoneNumber, protractor.Key.TAB);
    this.next();
  }
}
