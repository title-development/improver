import { $, $$, browser, by, element, promise, protractor } from 'protractor';
import { login, logout } from "../../utils/common.functions";
import { questionaries, unsupportedZip, users } from "../../../test.data";
import { SECOND } from "../../utils/util";

xdescribe('User cabinet', () => {

  let customer = users.customer;

  beforeEach(() => {
    browser.get('/');
  });

  afterEach(() => {
    //logout();
  });

  /**
   * TODO: Will work only if projectRequest of North America Development Group , LLC is active.
   * Replace this test case data with hardcoded project and company
  */
  it("should complete project and add review", () => {
    login(customer.email, customer.password);
    expect($(".header .user-name").getText()).toEqual(customer.firstName + " " + customer.lastName);

    let reviewText = "OMG OMG OMG OMG";

    $(".links-wrapper .link[routerLink='/projects']").click();
    $$(".project-card-wrapper .projectRequests").each(projectRequests => {

      projectRequests.$$(".projectRequest").count().then(size => {

        if (size >= 4) {
          projectRequests.element(by.xpath("ancestor::div[contains(concat(' ',normalize-space(@class),' '),' project-card-wrapper ')]")).click();
          $(".top-page-navigation .more-button-wrapper").click();
          element(by.xpath("//button[text()[contains(., 'Complete')]]")).click();
          element(by.xpath("//div[text()[contains(., 'North America Development Group , LLC')]]/ancestor::div[contains(concat(' ',normalize-space(@class),' '),' variant-wrapper ')]")).click();
          $(".buttons-wrapper button[type='submit']").click();
          browser.sleep(SECOND);
          element(by.xpath("//div[contains(concat(' ',normalize-space(@class),' '),' company-name ') and text()[contains(., 'North America Development Group , LLC')]]/ancestor::div[contains(concat(' ',normalize-space(@class),' '),' projectRequest ')]")).click();
          $('.sidebar button.add-review').click();
          $$('.review-post-form .rating-component .star').first().click();
          $('.review-post-message').sendKeys(reviewText);
          $("button.review-button[type='submit']").click();
          expect($$(".company-reviews-wrapper .ps-content .review-wrapper").first().$(".review-content").getText()).toEqual(reviewText);
        }

      })

    });

  });


});
