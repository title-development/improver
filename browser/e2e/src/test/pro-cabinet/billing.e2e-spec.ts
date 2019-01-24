import { $, $$, browser, by, element, promise, protractor } from 'protractor';
import { users } from "../../../test.data";
import { login, logout, sendKeysByOne } from "./../../utils/common.functions";
import { BillingHelper } from "../../utils/billing.helper";
import { FIVE_SECONDS, SECOND, THREE_SECONDS } from "../../utils/util";


describe('Billing', () => {

  let billingHelper: BillingHelper = new BillingHelper();
  let contractor = users.contractor;

  beforeEach(() => {

    login(contractor.email, contractor.password);
  });

  afterEach(() => {
    logout();
  });

  //TODO:Need contractor without payments cards
  xit('no added payment cards', () => {
    billingHelper.balanceLink();
    browser.sleep(SECOND);
    expect(element(by.css(".header .no-cards-row")).getText()).toEqual("Please add a credit/debit card to finish your account setup");
  });

  //TODO:Need contractor without payments cards
  xit('add card button while purchase a lead, if any cards added', () => {
    browser.waitForAngularEnabled(false);
    let buyFirstAvailableLead = element.all(by.buttonText('Buy')).filter(element1 => element1.isDisplayed()).first();
    buyFirstAvailableLead.click();
    browser.sleep(THREE_SECONDS);

    $$('.lead-actions-content-wrapper button').filter(item => item.isDisplayed()).first().click();
    //let addCardButtonText = element.all(by.css('.lead-actions-content-wrapper button')).filter(item => item.isDisplayed()).first().getText();
    browser.waitForAngularEnabled(true);
    //expect(addCardButtonText).toEqual("Add card");
    browser.sleep(SECOND);
    let driver = browser.driver;
    let iframe = by.css('[name="payment-card-form"] iframe');
    let iframeHtmlElement = driver.findElement(iframe);
    browser.switchTo().frame(iframeHtmlElement);
    driver.findElement(by.tagName('[name="cardnumber"]')).sendKeys(4242424242424242);
    driver.findElement(by.tagName('[name="exp-date"]')).sendKeys(1122);
    driver.findElement(by.tagName('[name="cvc"]')).sendKeys(1111);
    driver.findElement(by.tagName('[name="postal"]')).sendKeys(10022);
    browser.sleep(SECOND);
    browser.waitForAngularEnabled(false);
    browser.switchTo().defaultContent();
    $$('.payment-card-form .cv-button-flat').filter(item => item.isDisplayed()).first().click();
    browser.sleep(SECOND);
  });

  it('at least one card added', () => {
    billingHelper.balanceLink();
    browser.sleep(THREE_SECONDS);
    expect(element(by.css('.header span.ng-star-inserted')).getText()).toEqual("Select your default payment method");
    browser.sleep(SECOND);
  });

  it('replenish balance from valid card', () => {
    billingHelper.balanceLink();
    browser.sleep(THREE_SECONDS);

    let replenishBalanceButton = element(by.css('.cv-button'));
    replenishBalanceButton.click();
    browser.sleep(SECOND);

    /**
     *Step 1. Check hint, input amount, and click "Continue"
     */
    expect(element(by.css('.hint')).getText()).toBe('Please set an amount of money you want to replenish your balance.\nThis is a one time charge.');

    let amount = 50;
    let replenishWindow = element(by.css('.mat-dialog-container'));
    let replenishAmountInput = replenishWindow.element(by.name('amount'));
    replenishAmountInput.sendKeys(amount.toString());
    browser.sleep(SECOND);

    let continueReplenishBalanceButton = replenishWindow.element(by.buttonText('Continue'));
    continueReplenishBalanceButton.click();
    browser.sleep(SECOND);

    /**
     *Step 2. Check hint and replenish
     */
    expect($('.hint').getText()).toBe('$' + amount + '.00 will be charged to your payment method and added to your Home Improve balance.\nThis is a one time charge.');

    expect($(".charge-info .group .value").getText()).toEqual("$" + amount + ".00");

    replenishWindow = element(by.css('.mat-dialog-container'));
    let completeReplenishButton = replenishWindow.element(by.buttonText('Complete Purchase'));
    completeReplenishButton.click();
    browser.sleep(SECOND);
  });

  it('should change default card by default link', () => {
    billingHelper.balanceLink();
    browser.sleep(THREE_SECONDS);

    let defaultCardLink = element(by.css('.default-card'));
    defaultCardLink.click();
    browser.sleep(SECOND);

    billingHelper.radio(1);
    let saveDefaultCardButton = element(by.css('.default-payment-card-form .buttons-wrapper .cv-button'));
    saveDefaultCardButton.click();
    browser.sleep(SECOND);
  });

  it('should change default card by default button', () => {
    billingHelper.balanceLink();
    browser.sleep(THREE_SECONDS);

    let defaultCardButton = element(by.buttonText('Change default card'));
    defaultCardButton.click();
    browser.sleep(THREE_SECONDS);

    billingHelper.radio(1);
    let saveDefaultCardButton = element(by.css('.default-payment-card-form .buttons-wrapper .cv-button'));
    saveDefaultCardButton.click();
    browser.sleep(SECOND);
  });

  it('should add and remove valid card', () => {

    let initialCardsCount;
    let afterAddCardsCount;

    billingHelper.balanceLink();
    browser.sleep(SECOND);

    let cards = $$('.card-line');
    cards.count().then(countBefore => {

      initialCardsCount = countBefore;

      //Add new card
      let addNewCardButton = element(by.css('.cv-button-empty'));
      addNewCardButton.click();

      browser.sleep(SECOND);
      let driver = browser.driver;
      let iframe = by.css('[name="payment-card-form"] iframe');
      let iframeHtmlElement = driver.findElement(iframe);
      browser.waitForAngularEnabled(false);
      browser.switchTo().frame(iframeHtmlElement);
      sendKeysByOne(driver.findElement(by.tagName('[name="cardnumber"]')), 4242424242424242);
      sendKeysByOne(driver.findElement(by.tagName('[name="exp-date"]')), 1122);
      sendKeysByOne(driver.findElement(by.tagName('[name="cvc"]')), 1111);
      sendKeysByOne(driver.findElement(by.tagName('[name="postal"]')), 10022);
      browser.sleep(SECOND);
      browser.switchTo().defaultContent();
      $$('.payment-card-form .cv-button').filter(item => item.isDisplayed()).first().click();
      browser.sleep(FIVE_SECONDS);

      let cardsAfterAdd = $$('.card-line');
      cardsAfterAdd.count().then(countAfter => {
        afterAddCardsCount = countAfter;
        browser.sleep(THREE_SECONDS);

        expect(afterAddCardsCount).toEqual(initialCardsCount + 1);

        //Remove card
        $$('.payment-method-part .card-button').filter(item => item.isDisplayed()).first().click();
        $('.dialog-content-wrapper .confirm').click();

        browser.sleep(SECOND);
        // browser.waitForAngularEnabled(true);
      });

    });

  });

});
