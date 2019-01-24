import { browser, by, element, promise, protractor } from 'protractor';
import { login, logout } from "../../utils/common.functions";
import { questionaries, unsupportedZip, users } from "../../../test.data";
import { QuestionaryHelper } from "../../utils/questionary.helper";
import { SECOND, THREE_SECONDS } from "../../utils/util";

describe('Home Page', () => {

  let questionaryHelper: QuestionaryHelper = new QuestionaryHelper();
  let customer = users.customer;

  beforeEach(() => {
    browser.get('/');
  });

  afterEach(() => {
    logout();
  });

  it("should display main slogan", () => {
    expect(element(by.css("app-root h1")).getText()).toEqual("IT'S TIME FOR YOUR HOME IMPROVE");
  });

  it("should order service with specific questionary from anonymous unregistered user", () => {

    let mainSearchForm = element(by.css(".main-search-form"));
    let mainSearchInput = mainSearchForm.element(by.name("search"));

    mainSearchInput.sendKeys(questionaries.withQuestionary.name);
    browser.sleep(SECOND);
    mainSearchInput.sendKeys(protractor.Key.TAB, "10022", protractor.Key.ENTER);
    browser.sleep(SECOND);
    let continueButton = element(by.css(".start-screen-continue-button"));
    continueButton.click();

    questionaryHelper.radio(1);
    questionaryHelper.radioImage(0);
    questionaryHelper.radio(2);
    questionaryHelper.checkbox(1, 2, 3);
    questionaryHelper.inputNumeric(200);
    questionaryHelper.radio(1);
    questionaryHelper.radio(0);
    questionaryHelper.radio(1);
    questionaryHelper.textarea("I want to install tile in my new home. Tile is very expensive so I need real professionals");
    questionaryHelper.address("3 Avenue A", "New York", "New York", "10022");
    questionaryHelper.addressApplySuggested();
    questionaryHelper.personalInfo("Denzel", "Washington", "dancel@gmail.com", "9999999999");

    expect(element(by.css(".questionary-next-button")).getText()).toEqual("Submit");

  });

  it("should order service without specific questionary from anonymous registered user", () => {

    let mainSearchForm = element(by.css(".main-search-form"));
    let mainSearchInput = mainSearchForm.element(by.name("search"));

    mainSearchInput.sendKeys(questionaries.withoutQuestionary.name);
    browser.sleep(SECOND);
    mainSearchInput.sendKeys(protractor.Key.TAB, "10022", protractor.Key.ENTER);
    browser.sleep(SECOND);

    let continueButton = element(by.css(".start-screen-continue-button"));
    continueButton.click();

    questionaryHelper.radio(1);
    questionaryHelper.textarea("I want to install tile in my new home. Tile is very expensive so I need real professionals");
    questionaryHelper.address("3 Avenue A", "New York", "New York", "10022");
    questionaryHelper.addressApplySuggested();
    questionaryHelper.personalInfo("John", "Down", "user.improver@gmail.com", "9999999999");

    expect(element(by.css(".questionary-next-button")).getText()).toEqual("Ok");
  });

  it("should order service with specific questionary from Customer", () => {

    login(customer.email, customer.password);
    browser.sleep(SECOND);
    browser.get('/');

    let mainSearchForm = element(by.css(".main-search-form"));
    let mainSearchInput = mainSearchForm.element(by.name("search"));

    mainSearchInput.sendKeys(questionaries.withQuestionary.name);
    browser.sleep(SECOND);
    mainSearchInput.sendKeys(protractor.Key.TAB, "10022", protractor.Key.ENTER);
    browser.sleep(SECOND);
    let continueButton = element(by.css(".start-screen-continue-button"));
    continueButton.click();

    questionaryHelper.radio(0);
    questionaryHelper.radioImage(1);
    questionaryHelper.radio(2);
    questionaryHelper.checkbox(0);
    questionaryHelper.inputNumeric(200);
    questionaryHelper.radio(0);
    questionaryHelper.radio(1);
    questionaryHelper.radio(2);
    questionaryHelper.textarea("I want to install tile in my new home. Tile is very expensive so I need real professionals");
    questionaryHelper.address("3 Avenue A", "New York", "New York", "10022");
    questionaryHelper.addressApplySuggested();
    browser.sleep(THREE_SECONDS);

    expect(element.all(by.css(".projects-wrapper .project-title")).first().getText()).toEqual(questionaries.withQuestionary.name);
  });

  it("should order service without specific questionary from Customer", () => {
    login(customer.email, customer.password);
    browser.sleep(SECOND);
    browser.get('/');

    let mainSearchForm = element(by.css(".main-search-form"));
    let mainSearchInput = mainSearchForm.element(by.name("search"));

    mainSearchInput.sendKeys(questionaries.withoutQuestionary.name);
    browser.sleep(SECOND);
    mainSearchInput.sendKeys(protractor.Key.TAB, "10022", protractor.Key.ENTER);

    let continueButton = element(by.css(".start-screen-continue-button"));
    continueButton.click();

    questionaryHelper.radio(0);
    questionaryHelper.textarea("I want to install tile in my new home. Tile is very expensive so I need real professionals");
    questionaryHelper.address("3 Avenue A", "New York", "New York", "10022");
    questionaryHelper.addressApplySuggested();
    browser.sleep(THREE_SECONDS);

    expect(element.all(by.css(".projects-wrapper .project-title")).first().getText()).toEqual(questionaries.withoutQuestionary.name);

  });

  it("should show unsupported zip message in main search", () => {

    let mainSearchForm = element(by.css(".main-search-form"));
    let mainSearchInput = mainSearchForm.element(by.name("search"));

    mainSearchInput.sendKeys(questionaries.withQuestionary.name);
    browser.sleep(SECOND);
    mainSearchInput.sendKeys(protractor.Key.TAB, unsupportedZip, protractor.Key.ENTER);

    expect(element(by.css("confirm-dialog .header .header-content")).getText()).toEqual("Sorry, we are not in your area yet");
  });

  it("should show unsupported zip message in header search", () => {

    element(by.css(".find-professionals")).click();

    let headerSearchForm = element(by.css(".search-form"));
    let headerSearchInput = headerSearchForm.element(by.name("search"));

    headerSearchInput.sendKeys(questionaries.withQuestionary.name);
    browser.sleep(SECOND);
    headerSearchInput.sendKeys(protractor.Key.TAB, unsupportedZip, protractor.Key.ENTER);

    expect(element(by.css("confirm-dialog .header .header-content")).getText()).toEqual("Sorry, we are not in your area yet");

  });

  it("should show unsupported zip message by clicking on service banner", () => {

    element.all(by.css(".popular-services .popular-services-image")).get(0).click();
    element(by.css(".start-screen-continue-button")).click();
    element(by.name("zip")).sendKeys(unsupportedZip);
    element(by.css(".questionary-next-button")).click();

    expect(element(by.css("questionary-dialog .unsupported-zip-message")).getText()).toEqual("We are coming to your area soon.");

  });

});
