import { $, $$, browser, by, element, promise, protractor } from 'protractor';
import { users } from "../../../test.data";
import { login, logout, sendKeysByOne } from "./../../utils/common.functions";
import { BillingHelper } from "../../utils/billing.helper";
import { FIVE_SECONDS, SECOND, TEN_SECONDS, THREE_SECONDS } from "../../utils/util";
import {pageLink,  pageTitle,  headerLinkText,  billingHints,  dashboardCurrentUrl,  validPaymentCard, } from "../../utils/constants";


describe('Billing', () => {

  let billingHelper: BillingHelper = new BillingHelper();

  beforeEach(() => {
    login(users.contractor.email, users.contractor.password);
    browser.sleep(SECOND);
    browser.get(pageLink.billing);
    browser.sleep(SECOND);
  });

  afterEach(() => {
    logout();
  });

 it('should check dashboard and billing links', () => {
    browser.waitForAngularEnabled(false);
    element(by.partialLinkText(headerLinkText.dashboard)).click();
    browser.sleep(SECOND);
    expect(browser.getCurrentUrl()).toEqual(dashboardCurrentUrl);
    element(by.css(".balance-bar")).click();
    expect(element(by.css(".account-nav-title")).getText()).toEqual(pageTitle.billing);
    browser.sleep(SECOND);

    });
  //TODO:Need contractor without payments cards
  xit('no added payment cards', () => {
    billingHelper.balanceLink();
    browser.sleep(SECOND);
    expect(element(by.css(".header .no-cards-row")).getText()).toEqual(billingHints.noAddedPaymentCardHeader);
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
    driver.findElement(by.tagName('[name="cardnumber"]')).sendKeys(validPaymentCard.cardNumber);
    driver.findElement(by.tagName('[name="exp-date"]')).sendKeys(validPaymentCard.expDate);
    driver.findElement(by.tagName('[name="cvc"]')).sendKeys(validPaymentCard.cvc);
    driver.findElement(by.tagName('[name="postal"]')).sendKeys(validPaymentCard.postal);
    browser.sleep(SECOND);
    browser.waitForAngularEnabled(false);
    browser.switchTo().defaultContent();
    $$('.payment-card-form .cv-button-flat').filter(item => item.isDisplayed()).first().click();
    browser.sleep(SECOND);
  });

  it('at least one card added', () => {

    browser.waitForAngularEnabled(false);
    browser.sleep(SECOND);
    expect(element(by.css('.header span.ng-star-inserted')).getText()).toEqual(billingHints.selectDefaultPaymentCard);

  });

  it('replenish balance from valid card', () => {

    let replenishBalanceButton = element(by.css('.balance-part .cv-button'));
    replenishBalanceButton.click();
    browser.sleep(SECOND);

    //Step 1. Check hint, input amount, and click "Continue"

    expect(element(by.css('.hint')).getText()).toBe(billingHints.setAmountToReplenish);

    let amount = 50;
    let replenishWindow = element(by.css('.mat-dialog-container'));
    let replenishAmountInput = replenishWindow.element(by.name('amount'));
    replenishAmountInput.sendKeys(amount.toString());
    browser.sleep(SECOND);

    let continueReplenishBalanceButton = replenishWindow.element(by.buttonText('Continue'));
    continueReplenishBalanceButton.click();
    browser.sleep(SECOND);

    //Step 2. Check hint and replenish

    expect($('.hint').getText()).toBe('$' + amount + '.00 will be charged to your payment method and added to your Home Improve balance.\nThis is a one time charge.');

    expect($(".charge-info .group .value").getText()).toEqual("$" + amount + ".00");

    replenishWindow = element(by.css('.mat-dialog-container'));
    let completeReplenishButton = replenishWindow.element(by.buttonText('Complete Purchase'));
    completeReplenishButton.click();
    //menu is overlay by success message, can't open a menu for logout
    browser.sleep(TEN_SECONDS);
  });

  it('should change default card by default link', () => {

    let defaultCardLink = element(by.css('.default-card'));
    defaultCardLink.click();
    browser.sleep(SECOND);

    billingHelper.defaultPaymentCardRadio(1);
    let saveDefaultCardButton = element(by.css('.default-payment-card-form .buttons-wrapper .cv-button'));
    saveDefaultCardButton.click();
    browser.sleep(FIVE_SECONDS);
  });

  it('should change default card by default button', () => {

    let defaultCardButton = element(by.buttonText('Change default card'));
    defaultCardButton.click();
    browser.sleep(THREE_SECONDS);

    billingHelper.defaultPaymentCardRadio(1);
    let saveDefaultCardButton = element(by.css('.default-payment-card-form .buttons-wrapper .cv-button'));
    saveDefaultCardButton.click();
    browser.sleep(SECOND);
  });

  it('should add and remove valid card', () => {

    let initialCardsCount;
    let afterAddCardsCount;
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
