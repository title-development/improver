import { browser, by, element, promise, protractor } from 'protractor';
import {
  findInputErrorElementByName,
  login,
  logout,
  validateEmailInputs,
  validateFirstLastNameInputs, validatePhoneInputs, validateRegisteredEmail
} from "../../utils/common.functions";
import {
  questionaries,
  users,
  partlyValidLocation,
  unsupportedArea,
  validLocation, } from "../../../test.data";
import { QuestionaryHelper } from "../../utils/questionary.helper";
import { FIVE_SECONDS, SECOND, TEN_SECONDS, THREE_SECONDS } from "../../utils/util";
import { mainSlogan, errorMessages, questionaryAnonymousLastStep } from '../../utils/constants';


describe('Home Page', () => {

  let questionaryHelper: QuestionaryHelper = new QuestionaryHelper();
  let anonymousUser = users.notRegisteredCustomer;
  let authForm = element(by.css(".form-row .text-input-group"));
  let firstNameInput = authForm.element(by.name("firstName"));
  let lastNameInput = authForm.element(by.name("lastName"));
  let emailInput = authForm.element(by.name("email"));
  let phoneInput = authForm.element(by.name("phone"));

  beforeEach(() => {
    browser.get('/');
  });

  afterEach(() => {
    logout();
    browser.sleep(SECOND);
  });

  it("should display main slogan", () => {
    expect(element(by.css("app-root h1")).getText()).toEqual(mainSlogan);
  });

  it("should order service with specific questionary from anonymous unregistered user", () => {

    let mainSearchForm = element(by.css(".main-search-form"));
    let mainSearchInput = mainSearchForm.element(by.name("search"));

    mainSearchInput.sendKeys(questionaries.withQuestionary.name);
    browser.sleep(SECOND);
    mainSearchInput.sendKeys(protractor.Key.TAB, partlyValidLocation.zip, protractor.Key.ENTER);
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
    questionaryHelper.textarea(questionaries.projectDetails);
    questionaryHelper.address(partlyValidLocation.streetAddress, partlyValidLocation.city, partlyValidLocation.state, partlyValidLocation.zip);
    questionaryHelper.addressApplySuggested();
    questionaryHelper.personalInfo(anonymousUser.firstName, anonymousUser.lastName, anonymousUser.email, anonymousUser.phone);

    expect(element(by.css(".questionary-next-button")).getText()).toEqual("Submit");
  });

  it("should order service without specific questionary from anonymous registered user", () => {

    let mainSearchForm = element(by.css(".main-search-form"));
    let mainSearchInput = mainSearchForm.element(by.name("search"));
    let continueButton = element(by.css(".start-screen-continue-button"));

    mainSearchInput.sendKeys(questionaries.withoutQuestionary.name);
    browser.sleep(SECOND);
    mainSearchInput.sendKeys(protractor.Key.TAB, partlyValidLocation.zip, protractor.Key.ENTER);
    continueButton.click();
    questionaryHelper.radio(1);
    questionaryHelper.textarea(questionaries.projectDetails);
    questionaryHelper.address(partlyValidLocation.streetAddress, partlyValidLocation.city, partlyValidLocation.state, partlyValidLocation.zip);
    questionaryHelper.addressApplySuggested();
    questionaryHelper.personalInfo(users.customer.firstName, users.customer.lastName, users.customer.email, anonymousUser.phone);
    browser.sleep(SECOND);
    let elementLastStepHeader = element(by.css(".question-title"));
    expect(elementLastStepHeader.getText()).toEqual(questionaryAnonymousLastStep.header);
    let okButton = element(by.css(".questionary-next-button"));
    expect(okButton.getText()).toEqual(questionaryAnonymousLastStep.button);
    okButton.click();
  });

  it("should order service with specific questionary from Customer", () => {
    let mainSearchForm = element(by.css(".main-search-form"));
    let mainSearchInput = mainSearchForm.element(by.name("search"));
    let continueButton = element(by.css(".start-screen-continue-button"));

    login(users.customer.email, users.customer.password);
    browser.sleep(SECOND);

    browser.get('/');
    browser.waitForAngularEnabled(false);
    browser.sleep(SECOND);

    mainSearchInput.sendKeys(questionaries.withQuestionary.name);
    browser.sleep(SECOND);
    mainSearchInput.sendKeys(protractor.Key.TAB, partlyValidLocation.zip, protractor.Key.ENTER);
    browser.sleep(SECOND);

    continueButton.click();

    questionaryHelper.radio(0);
    questionaryHelper.radioImage(1);
    questionaryHelper.radio(2);
    questionaryHelper.checkbox(0);
    questionaryHelper.inputNumeric(200);
    questionaryHelper.radio(0);
    questionaryHelper.radio(1);
    questionaryHelper.radio(2);
    questionaryHelper.textarea(questionaries.projectDetails);
    questionaryHelper.address(partlyValidLocation.streetAddress, partlyValidLocation.city, partlyValidLocation.state, partlyValidLocation.zip);
    browser.sleep(THREE_SECONDS);
    questionaryHelper.addressApplySuggested();
    browser.sleep(THREE_SECONDS);
    expect(element.all(by.css(".projects-wrapper .project-title")).first().getText()).toEqual(questionaries.withQuestionary.name);
    //menu is overlay by success message, can't open a menu for logout
    browser.sleep(TEN_SECONDS);
  });

  it("should order service without specific questionary from Customer", () => {
    login(users.customer.email, users.customer.password);
    browser.sleep(SECOND);
    browser.get('/');

    let mainSearchForm = element(by.css(".main-search-form"));
    let mainSearchInput = mainSearchForm.element(by.name("search"));
    browser.waitForAngularEnabled(false);
    mainSearchInput.sendKeys(questionaries.withoutQuestionary.name);
    browser.sleep(SECOND);
    mainSearchInput.sendKeys(protractor.Key.TAB, partlyValidLocation.zip, protractor.Key.ENTER);
    browser.sleep(SECOND);

    let continueButton = element(by.css(".start-screen-continue-button"));
    continueButton.click();

    questionaryHelper.radio(0);
    questionaryHelper.textarea(questionaries.projectDetails);
    questionaryHelper.address(partlyValidLocation.streetAddress, partlyValidLocation.city, partlyValidLocation.state, partlyValidLocation.zip);
    browser.sleep(THREE_SECONDS);
    questionaryHelper.addressApplySuggested();
    browser.sleep(THREE_SECONDS);
    //menu is overlay by success message, can't open a menu for logout
    browser.sleep(TEN_SECONDS);
  });

  it("should show unsupported zip message in main search", () => {

    let mainSearchForm = element(by.css(".main-search-form"));
    let mainSearchInput = mainSearchForm.element(by.name("search"));
    let modalHeader = element(by.css(".dialog-content-wrapper .header .header-content"));

    mainSearchInput.sendKeys(questionaries.withQuestionary.name);
    mainSearchInput.sendKeys(protractor.Key.TAB, unsupportedArea.zip, protractor.Key.ENTER);
    browser.sleep(SECOND);
    expect(modalHeader.getText()).toEqual(unsupportedArea.notInYourAreaMessage);
  });

  it("should show unsupported zip message in header search", () => {
    let headerSearchForm = element(by.css(".search-form"));
    let headerSearchInput = headerSearchForm.element(by.name("search"));
    element(by.css(".find-professionals-button")).click();
    headerSearchInput.sendKeys(questionaries.withQuestionary.name);
    browser.sleep(SECOND);
    headerSearchInput.sendKeys(protractor.Key.TAB, unsupportedArea.zip, protractor.Key.ENTER);
    browser.sleep(SECOND);
    expect(element(by.css("confirm-dialog .header .header-content")).getText()).toEqual(unsupportedArea.notInYourAreaMessage);
  });

  it("should show unsupported zip message by clicking on service banner", () => {

    element.all(by.css(".popular-services .popular-services-image")).get(0).click();
    browser.sleep(SECOND);
    element(by.css(".start-screen-continue-button")).click();
    element(by.name("zip")).sendKeys(unsupportedArea.zip);
    element(by.css(".questionary-next-button")).click();
    browser.sleep(SECOND);
    expect(element(by.css("questionary-dialog .unsupported-zip-message")).getText()).toEqual(unsupportedArea.comingSoonMessage);
  });

  it("should check authorization form in a questionary", () => {

    let mainSearchForm = element(by.css(".main-search-form"));
    let mainSearchInput = mainSearchForm.element(by.name("search"));

    mainSearchInput.sendKeys(questionaries.withQuestionary.name);
    browser.sleep(SECOND);
    mainSearchInput.sendKeys(protractor.Key.TAB, validLocation.zip, protractor.Key.ENTER);
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
    questionaryHelper.textarea(questionaries.projectDetails);
    questionaryHelper.address(validLocation.streetAddress, validLocation.city, validLocation.state, validLocation.zip);

    //First name validation
    browser.sleep(SECOND);
    element(by.css(".questionary-next-button")).click();
    browser.sleep(SECOND);
    validateFirstLastNameInputs(firstNameInput, findInputErrorElementByName("firstName"), errorMessages.firstNameError, users.customer.firstName);

    //Last name validation
    validateFirstLastNameInputs(lastNameInput, findInputErrorElementByName("lastName"), errorMessages.lastNameError, users.customer.lastName);

    //Check email validation
    validateEmailInputs(emailInput, findInputErrorElementByName("email"), errorMessages.emailError);
    emailInput.sendKeys(users.customer.email);
    browser.sleep(SECOND);
    expect(findInputErrorElementByName("email").isPresent()).toBeFalsy();
    emailInput.clear();

    //Check phone number
    expect(findInputErrorElementByName("phone").getText()).toEqual(errorMessages.phoneError.emptyField);
    validatePhoneInputs(phoneInput, findInputErrorElementByName("phone"), errorMessages.phoneError);

    element(by.css(".close-modal")).click();
    browser.sleep(SECOND);
  });
});
