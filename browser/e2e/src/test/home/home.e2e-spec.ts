import { browser, by, element, protractor } from 'protractor';
import {
  closeNotificationPopup,
  confirmEmailConfirmationHintDialog,
  insertPhoneValidationCode,
  login,
  logout
} from "../../utils/common.functions";
import { partlyValidLocation, questionaries, unsupportedArea, users, } from "../../../test.data";
import { QuestionaryHelper } from "../../utils/questionary.helper";
import { mainSlogan, SECOND, THREE_SECONDS } from '../../utils/constants';


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
    mainSearchInput.sendKeys(protractor.Key.TAB, partlyValidLocation.zip, protractor.Key.ENTER);
    browser.sleep(SECOND);

    questionaryHelper.radio(1);
    questionaryHelper.radioImage(0);
    questionaryHelper.radio(2);
    questionaryHelper.checkbox(1, 2, 3);
    questionaryHelper.inputNumeric(200);
    questionaryHelper.radio(1);
    questionaryHelper.radio(0);
    questionaryHelper.radio(1);
    questionaryHelper.textarea(questionaries.projectDetails);
    questionaryHelper.setEmailForAnonymous(anonymousUser.email);
    browser.sleep(SECOND);
    questionaryHelper.personalInfo(users.customer.firstName, users.customer.lastName, anonymousUser.phone);
    browser.sleep(SECOND);
    insertPhoneValidationCode();
    questionaryHelper.next();
    browser.sleep(SECOND);
    questionaryHelper.address(partlyValidLocation.streetAddress, partlyValidLocation.city, partlyValidLocation.state, partlyValidLocation.zip);
    browser.sleep(THREE_SECONDS);
    questionaryHelper.addressApplySuggested();
    browser.sleep(THREE_SECONDS);
    expect(element(by.css(".notes .value")).getText()).toEqual(questionaries.projectDetails)
    expect(element(by.css(".approximately-how-many-square-feet-is-the-area-that-needs-tiling .value span")).getText()).toEqual("200")
    questionaryHelper.next();
    browser.sleep(SECOND);
    confirmEmailConfirmationHintDialog()
    browser.sleep(SECOND);
    closeNotificationPopup()
  });

  it("should order service without specific questionary from anonymous registered user", () => {
    let mainSearchForm = element(by.css(".main-search-form"));
    let mainSearchInput = mainSearchForm.element(by.name("search"));

    mainSearchInput.sendKeys(questionaries.withoutQuestionary.name);
    mainSearchInput.sendKeys(protractor.Key.TAB, partlyValidLocation.zip, protractor.Key.ENTER);
    browser.sleep(SECOND);

    questionaryHelper.radio(1);
    questionaryHelper.textarea(questionaries.projectDetails);
    questionaryHelper.setEmailForAnonymous(users.customer.email);
    browser.sleep(SECOND);
    questionaryHelper.setPassword(users.customer.password)
    browser.sleep(SECOND);
    questionaryHelper.address(partlyValidLocation.streetAddress, partlyValidLocation.city, partlyValidLocation.state, partlyValidLocation.zip);
    browser.sleep(THREE_SECONDS);
    questionaryHelper.addressApplySuggested();
    browser.sleep(THREE_SECONDS);
    expect(element(by.css(".notes .value")).getText()).toEqual(questionaries.projectDetails)
    questionaryHelper.next();
    browser.sleep(SECOND);
    closeNotificationPopup()
  });

  it("should order service with specific questionary from Customer", () => {
    let mainSearchForm = element(by.css(".main-search-form"));
    let mainSearchInput = mainSearchForm.element(by.name("search"));

    login(users.customer.email, users.customer.password);
    browser.sleep(SECOND);

    browser.get('/');
    browser.sleep(SECOND);

    mainSearchInput.sendKeys(questionaries.withQuestionary.name);
    mainSearchInput.sendKeys(protractor.Key.TAB, partlyValidLocation.zip, protractor.Key.ENTER);
    browser.sleep(SECOND);

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
    expect(element(by.css(".notes .value")).getText()).toEqual(questionaries.projectDetails)
    questionaryHelper.next();
    browser.sleep(SECOND);
    closeNotificationPopup()
  });

  it("should order service without specific questionary from Customer", () => {
    let mainSearchForm = element(by.css(".main-search-form"));
    let mainSearchInput = mainSearchForm.element(by.name("search"));

    login(users.customer.email, users.customer.password);
    browser.sleep(SECOND);

    browser.get('/');
    browser.sleep(SECOND);

    mainSearchInput.sendKeys(questionaries.withoutQuestionary.name);
    mainSearchInput.sendKeys(protractor.Key.TAB, partlyValidLocation.zip, protractor.Key.ENTER);
    browser.sleep(SECOND);

    questionaryHelper.radio(1);
    questionaryHelper.textarea(questionaries.projectDetails);
    questionaryHelper.address(partlyValidLocation.streetAddress, partlyValidLocation.city, partlyValidLocation.state, partlyValidLocation.zip);
    browser.sleep(THREE_SECONDS);
    questionaryHelper.addressApplySuggested();
    browser.sleep(THREE_SECONDS);
    expect(element(by.css(".notes .value")).getText()).toEqual(questionaries.projectDetails)
    questionaryHelper.next();
    browser.sleep(SECOND);
    closeNotificationPopup()
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

  it("should show service selector after click on trade banner", () => {
    login(users.customer.email, users.customer.password);
    browser.sleep(SECOND);

    browser.get('/my/projects');
    browser.sleep(SECOND);

    element.all(by.css(".recommended-services .recommended-services-card")).get(0).click();
    browser.sleep(SECOND);
    element.all(by.css(".cv-radio-group cv-radio")).get(3).click();
    questionaryHelper.next();

    browser.sleep(SECOND);
    questionaryHelper.radio(1);
    questionaryHelper.textarea(questionaries.projectDetails);
    questionaryHelper.address(partlyValidLocation.streetAddress, partlyValidLocation.city, partlyValidLocation.state, partlyValidLocation.zip);
    browser.sleep(THREE_SECONDS);
    questionaryHelper.addressApplySuggested();
    browser.sleep(THREE_SECONDS);
    expect(element(by.css(".notes .value")).getText()).toEqual(questionaries.projectDetails)
    questionaryHelper.next();
    browser.sleep(SECOND);
    closeNotificationPopup()
  });

});
