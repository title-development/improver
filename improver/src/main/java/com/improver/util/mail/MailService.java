package com.improver.util.mail;

import com.improver.entity.*;
import com.improver.model.in.OrderDetails;
import com.improver.model.out.PaymentCard;
import com.improver.service.PaymentService;
import com.improver.application.properties.BusinessProperties;
import com.improver.util.serializer.SerializationUtil;
import com.improver.security.JwtUtil;
import lombok.extern.slf4j.Slf4j;
import nz.net.ultraq.thymeleaf.LayoutDialect;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import javax.annotation.PostConstruct;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Optional;

import static com.improver.application.properties.Path.*;
import static com.improver.application.properties.UiPath.*;
import static com.improver.util.serializer.SerializationUtil.centsToUsd;
import static com.improver.util.serializer.SerializationUtil.formatUsd;

@Slf4j
@Service
public class MailService {

    // Defaults
    private static final String HOME_IMPROVE_FULL_NAME = "Home Improve, Inc.";
    private static final String HOME_IMPROVE_STREET_ADDRESS = "509 Madison Ave, 2004";
    private static final String HOME_IMPROVE_ADDRESS = "New York, NY 10022";

    private static final String SUPPORT_EMAIL = "support@homeimprove.com";
    private static final String SUPPORT_TEXT = "If you have any questions you can contact us at";
    private static final String SIGNATURE = "Sincerely, The Home Improve Team";
    private static final String THANK_YOU_FOR_JOIN = "Thank you for join Home Improve!";
    private static final String HOME_IMPROVE = "Home Improve";

    // Email Subjects
    private static final String SBJ_CONFIRM_REGISTRATION = HOME_IMPROVE + " - Please confirm your registration";

    // Templates
    private static final String NOTICE_TEMPLATE = "email/notice";
    private static final String CONFIRMATION_TEMPLATE = "email/confirmation";
    private static final String PROJECT_DETAILS_TEMPLATE = "email/projectDetails";
    private static final String TEXT_AREA_TEMPLATE = "email/textArea";

    // Template parts keys
    private static final String TITLE = "title";
    private static final String BODY = "body";
    private static final String CONFIRM_URL = "confirmUrl";
    private static final String CONFIRM_BTN_TEXT = "confirmBtnText";
    private static final String USER_NAME = "userName";
    private static final String TEXT_AREA_TITLE = "textAreaTitle";
    private static final String TEXT_AREA_CONTENT = "textAreaContent";
    private static final String BODY_BEFORE_AREA = "bodyBeforeArea";
    private static final String BODY_AFTER_AREA = "bodyAfterArea";

    // Template CSS Keys
    private static final String CONTENT_ALIGN = "contentAlign";

    @Autowired private MailClient mailClient;
    @Autowired private TemplateEngine templateEngine;
    @Autowired private PaymentService paymentService;
    @Autowired private JwtUtil jwtUtil;

    @Value("${site.url}") private String siteUrl;

    private Context contextTemplate() {
        Context context = new Context();
        context.setVariable("siteUrl", siteUrl);
        context.setVariable("logoUrl", siteUrl + LOGO_URL);
        context.setVariable("supportText", SUPPORT_TEXT);
        context.setVariable("supportEmail", SUPPORT_EMAIL);
        context.setVariable("signature", SIGNATURE);
        context.setVariable("homeImproveFullName", HOME_IMPROVE_FULL_NAME);
        context.setVariable("homeImproveStreetAddress", HOME_IMPROVE_STREET_ADDRESS);
        context.setVariable("homeImproveAddress", HOME_IMPROVE_ADDRESS);
        context.setVariable(CONTENT_ALIGN, "center");
        return context;
    }

    @PostConstruct
    private void init() {
        templateEngine.addDialect(new LayoutDialect());
    }

    /**
     * Send registration email to new user.
     *
     * @param user new customer
     */
    public void sendRegistrationConfirmEmail(User user) {
        Context context = contextTemplate();
        context.setVariable(USER_NAME, user.getFirstName());
        context.setVariable(TITLE, THANK_YOU_FOR_JOIN);
        context.setVariable(BODY, "To finish signing up, you just need to confirm that we got your email right.");
        context.setVariable(CONFIRM_URL, siteUrl + CONFIRM + ACTIVATION + SLASH + jwtUtil.generateActivationJWT(user.getValidationKey(), user.getEmail()));
        context.setVariable(CONFIRM_BTN_TEXT, "Confirm");
        mailClient.sendMail(SBJ_CONFIRM_REGISTRATION, CONFIRMATION_TEMPLATE, context, MailHolder.MessageType.NOREPLY, user.getEmail());
    }


    /**
     * Send email to User that has been updated his password.
     *
     * @param user user that has been updated his password
     */
    public void sendPasswordUpdated(User user) {
        Context context = contextTemplate();
        context.setVariable(USER_NAME, user.getFirstName());
        context.setVariable(TITLE, "Your password was updated");
        context.setVariable(BODY, "If you did not do this action please contact support immediately");
        mailClient.sendMail("Your password was updated", NOTICE_TEMPLATE, context, MailHolder.MessageType.NOREPLY, user.getEmail());
    }


    /**
     * Send email to User that has been requested password reset.
     *
     * @param user user that has been updated his password
     */
    public void sendPasswordRestore(User user) {
        Context context = contextTemplate();
        context.setVariable(USER_NAME, user.getFirstName());
        context.setVariable(TITLE, "Now you can reset your password");
        context.setVariable(BODY, "You requested a password reset. For next step, you need to proceed by the following link");
        context.setVariable(CONFIRM_URL, siteUrl + UI_RESTORE_PASSWORD + SLASH + jwtUtil.generateActivationJWT(user.getValidationKey(), user.getEmail()));
        context.setVariable(CONFIRM_BTN_TEXT, "Reset password");
        mailClient.sendMail("Password restoring", CONFIRMATION_TEMPLATE, context, MailHolder.MessageType.NOREPLY, user.getEmail());
    }


    /**
     * Send email to User that has been changed his email address to confirm it.
     *
     * @param user user that has been changed his email address
     */
    public void sendEmailChanged(User user) {
        Context context = contextTemplate();
        context.setVariable(USER_NAME, user.getFirstName());
        context.setVariable(TITLE, "Your email has been changed!");
        context.setVariable(BODY, "Now you just need to confirm that we got your email right");
        String pageUrl = siteUrl + CONFIRM + EMAIL;
        context.setVariable(CONFIRM_URL, pageUrl + SLASH + jwtUtil.generateActivationJWT(user.getValidationKey(), user.getNewEmail()));
        context.setVariable(CONFIRM_BTN_TEXT, "Confirm");
        mailClient.sendMail("Please confirm your new email", CONFIRMATION_TEMPLATE, context, MailHolder.MessageType.NOREPLY, user.getNewEmail());
    }


    /**
     * Send notice email to User that has been changed his email address. Notice will be sent to his old email address.
     *
     * @param user user that has been changed his email address
     */
    public void sendEmailChangedNotice(User user) {
        Context context = contextTemplate();
        context.setVariable(USER_NAME, user.getFirstName());
        context.setVariable(TITLE, "Your email has been changed to " + highlight(user.getNewEmail()));
        context.setVariable(BODY, "if you did not do this action, please contact with support immediately!");
        mailClient.sendMail("Account email is changed", NOTICE_TEMPLATE, context, MailHolder.MessageType.NOREPLY, user.getEmail());
    }


    public void sendDeletedAccount(User user) {
        Context context = contextTemplate();
        context.setVariable(TITLE, "Your account has been deleted.");
        context.setVariable(BODY, "If you want to restore your account please contact the support team.");
        mailClient.sendMail("Account Deleted", NOTICE_TEMPLATE, context, MailHolder.MessageType.NOREPLY, user.getEmail());
    }


    public void sendRestoredAccount(User user) {
        Context context = contextTemplate();
        context.setVariable(TITLE, "Your account has been restored.");
        context.setVariable(BODY, "Please visit " + wrapLink("Home Improve", siteUrl) + " to check your personal cabinet state");
        mailClient.sendMail("Account Restored", NOTICE_TEMPLATE, context, MailHolder.MessageType.NOREPLY, user.getEmail());
    }


    /**
     * Send email to User that his account has been blocked
     *
     * @param user user whose account has been blocked
     */
    public void sendBlockAccount(User user) {
        Context context = contextTemplate();
        context.setVariable(USER_NAME, user.getFirstName());
        context.setVariable(TITLE, "Your account has been blocked");
        context.setVariable(BODY, "Your Home Improve account has been blocked. You can contact with a support team to appeal the decision.");
        mailClient.sendMail("Account blocking", NOTICE_TEMPLATE, context, MailHolder.MessageType.NOREPLY, user.getEmail());
    }


    /********************************************************************************************************
     *                                                  CUSTOMER
     ********************************************************************************************************/

    public void sendAutoRegistrationConfirmEmail(Customer customer, Project project, OrderDetails details) {
        Context context = contextTemplate();
        String serviceType = project.getServiceType().getName();
        context.setVariable(USER_NAME, customer.getFirstName());
        context.setVariable(TITLE, "Your project has been submitted!");
        context.setVariable("serviceType", serviceType);
        context.setVariable(BODY, "You've submitted project request for " + serviceType + ". If you didn't do this action, please skip this mail.");
        context.setVariable("message", "We've created a cabinet for you where you can track the status and manage your project request. To view your project request please proceed to Home Improve.");
        context.setVariable("projectDetails", details);
        context.setVariable(CONFIRM_URL, siteUrl + CONFIRM + PASSWORD + SLASH + jwtUtil.generateActivationJWT(customer.getValidationKey(), customer.getEmail()));
        context.setVariable(CONFIRM_BTN_TEXT, "Proceed to Home Improve");
        mailClient.sendMail(SBJ_CONFIRM_REGISTRATION, PROJECT_DETAILS_TEMPLATE, context, MailHolder.MessageType.NOREPLY, customer.getEmail());
    }


    public void sendOrderSubmitMail(Customer customer, Project project, OrderDetails details) {
        if (!customer.getMailSettings().isProjectLifecycle()) {
            return;
        }
        Context context = contextTemplate();
        String serviceType = project.getServiceType().getName();
        context.setVariable(USER_NAME, customer.getFirstName());
        context.setVariable(TITLE, "Your project has been submitted!");
        context.setVariable(BODY, "You've submitted project request for "
            + highlight(serviceType) +
            ". If you didn't do this action, please skip this mail.");
        context.setVariable("projectDetails", details);
        context.setVariable(CONFIRM_URL, siteUrl + CUSTOMER_PROJECTS + project.getId());
        context.setVariable(CONFIRM_BTN_TEXT, "View project");
        mailClient.sendMail("Your project has been submitted", PROJECT_DETAILS_TEMPLATE, context, MailHolder.MessageType.NOREPLY, customer.getEmail());
    }

    /**
     * Send email about new proposal form Contractor.
     *
     * @param company contractor that purchased lead
     * @param project project that is purchased
     */
    public void sendNewProposalEmail(Company company, Project project) {
        Customer customer = project.getCustomer();
        if (!customer.getMailSettings().isProRequests()) {
            return;
        }
        Context context = contextTemplate();
        context.setVariable(USER_NAME, customer.getFirstName());
        context.setVariable(TITLE, "You have new Professional's request to your project");
        context.setVariable(BODY, "New proposal from " +
            highlight(company.getName()) + " about " +
            highlight(project.getServiceType().getName()));
        context.setVariable(CONFIRM_URL, siteUrl + CUSTOMER_PROJECTS + project.getId());
        context.setVariable(CONFIRM_BTN_TEXT, "View project");
        mailClient.sendMail("New project request from " + company.getName(), CONFIRMATION_TEMPLATE, context, MailHolder.MessageType.NOREPLY, customer.getEmail());
    }


    public void sendReviewRevisionRequest(Company company, Review review, String serviceType, String comment) {
        Context context = contextTemplate();
        String publishDate = review.getPublishDate().format(DateTimeFormatter.ISO_LOCAL_DATE);
        context.setVariable(CONTENT_ALIGN, "left");
        context.setVariable(TITLE, "Your have new review revision request");
        context.setVariable(BODY_BEFORE_AREA, String.format("%s would like you to revise your review on %s project. Till %s Pro may contact you to fix outstanding problems if any.",
            highlight(company.getName()), highlight(serviceType), highlight(publishDate)));
        context.setVariable(TEXT_AREA_TITLE,"Message from Pro:");
        context.setVariable(TEXT_AREA_CONTENT, comment);
        context.setVariable(BODY_AFTER_AREA, String.format("Revision request expires after %1$s and if you would not revise it, your original review won't be changed." +
            "<br/>We may send you a reminder if you haven't responded till %s.", highlight(publishDate)));
        context.setVariable(CONFIRM_URL, siteUrl + UI_CUSTOMER_BASE_PATH + "/review-revision/" + review.getId());
        context.setVariable(CONFIRM_BTN_TEXT, "Edit review");
        mailClient.sendMail("Review revision request", TEXT_AREA_TEMPLATE, context, MailHolder.MessageType.NOREPLY, review.getCustomer().getEmail());
    }


    public void sendProjectStatusChanged(Project project, Project.Reason reason) {
        Customer customer = project.getCustomer();
        Context context = contextTemplate();
        context.setVariable(USER_NAME, customer.getFirstName());
        context.setVariable(TITLE, "Project status changed");
        StringBuilder body = new StringBuilder("Your ").append(highlight(project.getServiceType().getName())).append(" project has been");
        switch (project.getStatus()){
            case INVALID:
                body.append(" invalidated");
                break;
            case VALIDATION:
                body.append(" sent to manual validation");
                break;
            case ACTIVE:
            case IN_PROGRESS:
                body.append(" validated and now is matching with appropriate professionals.");
                break;
            default:
                throw new IllegalArgumentException("Project status=" + project.getStatus() + " is not handled!");
        }
        if (reason != null) {
            body.append("<br/> Reason: ").append(highlight(reason.getPhrase()));
        }
        context.setVariable(BODY, body);
        context.setVariable(CONFIRM_URL, siteUrl + CUSTOMER_PROJECTS + project.getId());
        context.setVariable(CONFIRM_BTN_TEXT, "View project");
        mailClient.sendMail("Project status changed", CONFIRMATION_TEMPLATE, context, MailHolder.MessageType.NOREPLY, customer.getEmail());
    }


    /********************************************************************************************************
     *                                                  PRO
     ********************************************************************************************************/


    /**
     * Send email about Project requests
     *
     * @param pro     contractor that purchased lead
     * @param subject Subject of email
     * @param email   Recipient email
     * @param message Message body
     * @param token   RequestReview token
     */
    public void sendRequestReviewForNewUser(Contractor pro, String subject, String message, String email, String token) {
        Context context = contextTemplate();
        context.setVariable(TITLE, subject);
        context.setVariable(BODY, message);
        context.setVariable(CONFIRM_URL, siteUrl + COMPANIES + SLASH + pro.getCompany().getId() + "?review-token=" + token);
        context.setVariable(CONFIRM_BTN_TEXT, "Write a review");
        mailClient.sendMail("Request review from " + pro.getCompany().getName(), CONFIRMATION_TEMPLATE, context, MailHolder.MessageType.NOREPLY, email);
    }

    /**
     * Send email with unreviewed project requests
     *
     * @param pro     contractor that purchased lead
     * @param subject Subject of email
     * @param email   Recipient email
     * @param message Message body
     */
    public void sendNewRequestReview(Contractor pro, String subject, String message, String email) {
        Context context = contextTemplate();
        context.setVariable(TITLE, subject);
        context.setVariable(BODY, message);
        mailClient.sendMail("Request review from " + pro.getCompany().getName(), NOTICE_TEMPLATE, context, MailHolder.MessageType.NOREPLY, email);
    }

    /**
     * Send purchase confirmation email to contractor.
     *
     * @param contractor     contractor that purchased lead
     * @param projectRequest projectRequest created after purchase
     */
    public void sendManualLeadPurchaseEmail(Contractor contractor, ProjectRequest projectRequest) {
        if (!contractor.getCompany().getCompanyConfig().getNotificationSettings().isLeadReceipts()) {
            return;
        }
        Context context = contextTemplate();
        Project project = projectRequest.getProject();
        context.setVariable(USER_NAME, contractor.getFirstName());
        context.setVariable(TITLE, "You've purchased new lead");
        context.setVariable(BODY, highlight(project.getServiceType().getName()) +
            " request from " +
            highlight(project.getCustomer().getDisplayName()));
        context.setVariable(CONFIRM_URL, siteUrl + PRO_PROJECTS + projectRequest.getId());
        context.setVariable(CONFIRM_BTN_TEXT, "View project");
        mailClient.sendMail("Lead purchase", CONFIRMATION_TEMPLATE, context, MailHolder.MessageType.BILLING, contractor.getEmail());
    }

    /**
     * Send purchase confirmation email to contractor.
     *
     * @param company        contractor that purchased lead
     * @param projectRequest projectRequest created after purchase
     */
    public void sendLeadAutoPurchaseEmail(Company company, ProjectRequest projectRequest) {
        Context context = contextTemplate();
        Project project = projectRequest.getProject();
        context.setVariable(TITLE, "You received new subscription lead");
        context.setVariable(BODY, highlight(project.getServiceType().getName()) +
            " request from " +
            highlight(project.getCustomer().getDisplayName()));
        context.setVariable(CONFIRM_URL, siteUrl + PRO_PROJECTS + projectRequest.getId());
        context.setVariable(CONFIRM_BTN_TEXT, "View project");
        mailClient.sendMail("New lead by subscription", CONFIRMATION_TEMPLATE, context, MailHolder.MessageType.BILLING, getRecipients(company));
    }


    /**
     * Send email to Contractor that he is hired by Customer.
     *
     * @param contractor     contractor that purchased lead
     * @param projectRequest projectRequest created after purchase
     */
    public void sendHiredContractorEmail(Contractor contractor, ProjectRequest projectRequest) {
        Context context = contextTemplate();
        Project project = projectRequest.getProject();
        context.setVariable(TITLE, "You have been hired by customer");
        context.setVariable(BODY, highlight(project.getCustomer().getDisplayName()) +
            " hired you for " +
            highlight(project.getServiceType().getName()) +
            " project");
        context.setVariable(CONFIRM_URL, siteUrl + PRO_PROJECTS + projectRequest.getId());
        context.setVariable(CONFIRM_BTN_TEXT, "View project");
        mailClient.sendMail("You've been hired", CONFIRMATION_TEMPLATE, context, MailHolder.MessageType.NOREPLY, contractor.getEmail());
    }


    /**
     * Send email to Contractor that he has canceled subscription.
     *
     * @param company        current company
     * @param timeZoneOffset time zone offset
     */
    public void sendSubscriptionCancel(Company company, int timeZoneOffset) {
        Subscription subscription = company.getBilling().getSubscription();
        String endDate = subscription.getNextBillingDate().withZoneSameInstant(ZoneOffset.ofTotalSeconds(timeZoneOffset * 60)).format(DateTimeFormatter.ISO_LOCAL_DATE);
        String[] recipients = getRecipients(company);
        Context context = contextTemplate();
        context.setVariable(TITLE, "You have canceled your subscription");
        context.setVariable(BODY, "You have canceled your subscription for the next billing period. " +
            "But you will still receive leads up to " + highlight("$" + SerializationUtil.centsToUsd(subscription.getBudget())) +
            " till the end of this billing period (" + highlight(endDate) + ")");
        context.setVariable(CONFIRM_URL, siteUrl + BILLING_URL);
        context.setVariable(CONFIRM_BTN_TEXT, "Check billing");
        mailClient.sendMail("Subscription canceled", CONFIRMATION_TEMPLATE, context, MailHolder.MessageType.BILLING, recipients);
    }

    /**
     * Send email to Company and all it's Contractors that company subscription is changed.
     *
     * @param company        current company
     * @param timeZoneOffset time zone offset
     * @param isNew          true if its new subscription and false if its update of subscription
     */
    public void sendSubscriptionNotification(Company company, int timeZoneOffset, boolean isNew) {
        Subscription subscription = company.getBilling().getSubscription();
        String endDate = subscription.getNextBillingDate().withZoneSameInstant(ZoneOffset.ofTotalSeconds(timeZoneOffset * 60)).format(DateTimeFormatter.ISO_LOCAL_DATE);
        String[] recipients = getRecipients(company);
        if (isNew) {
            sendSubscriptionActivated(subscription.getBudget(), endDate, recipients);
        } else {
            sendSubscriptionUpdate(subscription.getNextBudget(), endDate, recipients);
        }
    }

    private void sendSubscriptionActivated(int currentBudget, String endDate, String... recipients) {
        Context context = contextTemplate();
        context.setVariable(TITLE, "You have subscribed for a stream of leads from Home Improve");
        context.setVariable(BODY, "You will receive leads up to " + highlight(formatUsd(currentBudget)) +
            " to the end of the current billing period (" + highlight(endDate) + ").");
        context.setVariable(CONFIRM_URL, siteUrl + BILLING_URL);
        context.setVariable(CONFIRM_BTN_TEXT, "Check billing");
        mailClient.sendMail("Subscription confirmed for Home Improve", CONFIRMATION_TEMPLATE, context, MailHolder.MessageType.BILLING, recipients);
    }

    private void sendSubscriptionUpdate(int nextBudget, String endDate, String... recipients) {
        Context context = contextTemplate();
        context.setVariable(TITLE, "You've updated your subscription");
        context.setVariable(BODY, String.format("You have updated your monthly budget for next billing period up to %s. Next billing period starts on %s.",
            highlight(formatUsd(nextBudget)), highlight(endDate)));
        context.setVariable(CONFIRM_URL, siteUrl + BILLING_URL);
        context.setVariable(CONFIRM_BTN_TEXT, "Check billing");
        mailClient.sendMail("Subscription budget updated for Home Improve", CONFIRMATION_TEMPLATE, context, MailHolder.MessageType.BILLING, recipients);
    }

    public void sendSubscriptionExpired(Company company) {
        Context context = contextTemplate();
        String date = ZonedDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE);
        context.setVariable(TITLE, "Subscription has expired");
        context.setVariable(BODY, "Your monthly subscription has expired on " + highlight(date) + ".");
        context.setVariable(CONFIRM_URL, siteUrl + BILLING_URL);
        context.setVariable(CONFIRM_BTN_TEXT, "Check billing");
        mailClient.sendMail("Subscription for Home Improve expired", CONFIRMATION_TEMPLATE, context, MailHolder.MessageType.BILLING, getRecipients(company));
    }

    private String getLast4DigitsSilent(Company company) {
        PaymentCard card = paymentService.getDefaultCard(company);
        return Optional.ofNullable(card).map(PaymentCard::getLast4).
            orElse("not defined");
    }


    public void sendSubscriptionProlongation(Company company, int charged, int budget, ZonedDateTime nextBillingDate) {
        Context context = contextTemplate();
        String subject = "Successful payment for Home Improve subscription";
        String date = nextBillingDate.format(DateTimeFormatter.ISO_LOCAL_DATE);
        String last4digits = getLast4DigitsSilent(company);

        context.setVariable(TITLE, "Subscription is prolonged for next billing period");
        StringBuilder body = new StringBuilder("Thank you for being a member of Home Improve.");
        if (charged > 0) {
            body.append("We successfully charged ").append(highlight(formatUsd(charged)))
                .append(" to your credit card ending in ").append(last4digits)
                .append(" to fulfill Subscription Budget of $").append(SerializationUtil.centsToUsd(budget));
        } else {
            body.append(" We reserved $").append(SerializationUtil.centsToUsd(budget)).append(" on balance for Subscription Budget of $").append(SerializationUtil.centsToUsd(budget));
        }
        body.append("<br/>");
        body.append("Next billing date is ").append(highlight(date)).append(".");
        context.setVariable(BODY, body.toString());
        context.setVariable(CONFIRM_URL, siteUrl + BILLING_URL);
        context.setVariable(CONFIRM_BTN_TEXT, "Check billing");
        mailClient.sendMail(subject, CONFIRMATION_TEMPLATE, context, MailHolder.MessageType.BILLING, getRecipients(company));
    }


    public void sendSubscriptionProlongationFailure(Company company, ZonedDateTime endDate, int nextBudget, boolean tryAgain) {
        Context context = contextTemplate();
        String subject = "Payment failed for Home Improve subscription";
        String date = endDate.format(DateTimeFormatter.ISO_LOCAL_DATE);
        PaymentCard card = paymentService.getDefaultCard(company);
        context.setVariable(TITLE, subject);
        StringBuilder body = new StringBuilder(String.format("Your monthly subscription has expired on %s.", highlight(date)))
            .append("<br/>")
            .append("We tried to charge you ").append(highlight(formatUsd(nextBudget)));
        if (card != null) {
            body.append(" to your credit card ending at ").append(highlight(card.getLast4()));
        }
        body.append(" for your PRO subscription of Home Improve, however, the transaction failed.");
        if (card == null) {
            body.append(" We could not find active credit cards in your account.");
        }
        body.append("<br/>");
        if (tryAgain) {
            body.append("Please note that we will try charging your card again in 1 day.");
        } else {
            body.append(String.format("Please note that we deactivated your subscription due to failed payments %s days in a row.", BusinessProperties.SUBSCRIPTION_CHARGE_ATTEMPTS));
        }
        body.append("<br/>");
        body.append("To ensure continued use of the Subscription, please make sure your billing information is up to date.");

        context.setVariable(BODY, body.toString());
        context.setVariable(CONFIRM_URL, siteUrl + BILLING_URL);
        context.setVariable(CONFIRM_BTN_TEXT, "Check billing");
        mailClient.sendMail(subject, CONFIRMATION_TEMPLATE, context, MailHolder.MessageType.BILLING, getRecipients(company));
    }

    public void sendRefundRequestAccepted(Company company, String customer, String serviceType) {
        Context context = contextTemplate();
        context.setVariable(TITLE, "Refund request accepted on review");
        context.setVariable(BODY, String.format("Refund request for project \"%s for %s\" is accepted on review." +
                " We may contact you to clarify some details regarding this project." +
                " You can track status of your refund request in PRO Dashboard",
            highlight(serviceType), highlight(customer)));
        context.setVariable(CONFIRM_URL, siteUrl + PRO + DASHBOARD);
        context.setVariable(CONFIRM_BTN_TEXT, "View in Dashboard");
        mailClient.sendMail("Refund request in review", CONFIRMATION_TEMPLATE, context, MailHolder.MessageType.NOREPLY, getRecipients(company));
    }


    public void sendRefundRequestApproved(Company company, String customer, String serviceType) {
        Context context = contextTemplate();
        context.setVariable(TITLE, "Refund request is approved");
        context.setVariable(BODY, String.format("Refund request for project \"%s for %s\" is approved." +
                " We credit back the lead price to you internal balance at Home Improve",
            highlight(serviceType), highlight(customer)));
        mailClient.sendMail("Refund request is approved", NOTICE_TEMPLATE, context, MailHolder.MessageType.NOREPLY, getRecipients(company));
    }


    public void sendRefundRequestRejected(Company company, String customer, String serviceType) {
        Context context = contextTemplate();
        context.setVariable(TITLE, "Refund request is rejected");
        context.setVariable(BODY, String.format("Refund request for project \"%s for %s\" is rejected according to Home Improve %s",
            highlight(serviceType), highlight(customer), wrapLink("Lead Return Credit Policy", siteUrl + TERMS_OF_USE_URL)));
        mailClient.sendMail("Refund request is rejected", NOTICE_TEMPLATE, context, MailHolder.MessageType.NOREPLY, getRecipients(company));
    }

    public void sendNewReviewReceivedMail(Company company, Review review) {
        Context context = contextTemplate();
        context.setVariable(CONTENT_ALIGN, "left");
        context.setVariable(TITLE, "Your company received a new review");
        context.setVariable(BODY_BEFORE_AREA, String.format("%s has been rated with %d star(s) by %s" ,
            highlight(company.getName()), review.getScore(), highlight(review.getCustomer().getDisplayName())));
        context.setVariable(TEXT_AREA_TITLE,"Review comment:");
        context.setVariable(TEXT_AREA_CONTENT, review.getDescription());
        context.setVariable(CONFIRM_URL, siteUrl + COMPANIES + SLASH + company.getId());
        context.setVariable(CONFIRM_BTN_TEXT, "View at Profile");
        mailClient.sendMail("New review is received", TEXT_AREA_TEMPLATE, context, MailHolder.MessageType.NOREPLY, getRecipients(company));
    }

    public void sendReviewPublishedMail(Company company, Review review) {
        Context context = contextTemplate();
        context.setVariable(CONTENT_ALIGN, "left");
        context.setVariable(TITLE, "A review has been published");
        context.setVariable(BODY_BEFORE_AREA, String.format("A review from %s with rating of %s star(s) has been published at %s profile page",
            highlight(review.getCustomer().getDisplayName()), highlight(String.valueOf(review.getScore())), highlight(company.getName())));
        context.setVariable(TEXT_AREA_TITLE,"Review comment:");
        context.setVariable(TEXT_AREA_CONTENT, review.getDescription());
        context.setVariable(CONFIRM_URL, siteUrl + COMPANIES + SLASH + company.getId());
        context.setVariable(CONFIRM_BTN_TEXT, "View at Profile");
        mailClient.sendMail("Review is published", TEXT_AREA_TEMPLATE, context, MailHolder.MessageType.NOREPLY, getRecipients(company));
    }

    public void sendNewNegativeReviewMail(Company company, Review review, Customer customer) {
        Context context = contextTemplate();
        String publishDate = review.getPublishDate().format(DateTimeFormatter.ISO_LOCAL_DATE);
        context.setVariable(CONTENT_ALIGN, "left");
        context.setVariable(TITLE, "Your company has received a low rating review");
        context.setVariable(BODY_BEFORE_AREA, String.format("%1$s has been rated with %4$s star(s) by %2$s." +
                " A low rating review will not be published on your profile page until %3$s.",
            highlight(company.getName()), highlight(customer.getDisplayName()), highlight(publishDate), highlight(String.valueOf(review.getScore())) ));
        context.setVariable(TEXT_AREA_TITLE,"Review comment:");
        context.setVariable(TEXT_AREA_CONTENT, review.getDescription());
        context.setVariable(BODY_AFTER_AREA, String.format("You can ask client for review revision till publishing date." +
                " Client cannot rate you lower than original review. We recommend to get in touch with %1$s and try to fix outstanding issues if any." +

                "<br/><br/>If the client accepts your request, the revised review will be published on your profile." +
                "<br/>If the client declines your request, or not respond till %2$s, the original review will be published." +
                "<br/>We'll let you know the client’s decision immediately by email. Regardless of the outcome of your request, please respect the client decision." ,
            highlight(customer.getDisplayName()), highlight(publishDate)));
        context.setVariable(CONFIRM_URL, siteUrl + COMPANIES + SLASH + company.getId() + "#reviews");
        context.setVariable(CONFIRM_BTN_TEXT, "View at Profile");
        mailClient.sendMail("Low rating review", TEXT_AREA_TEMPLATE, context, MailHolder.MessageType.NOREPLY, getRecipients(company));
    }


    /**
     * Preparing array of distinct emails for notify company and all contractors of the company
     *
     * @param company current company
     */
    private String[] getRecipients(Company company) {
        String[] emails = company.getContractors().stream()
            .map(User::getEmail)
            .toArray(String[]::new);
        return emails;
    }

    public void sendBalanceReplenished(Company company, int amount) {
        Context context = contextTemplate();
        context.setVariable(TITLE, "Balance replenishment");
        context.setVariable(BODY, "You have replenished the balance by " + highlight(formatUsd(amount)) + ".");
        context.setVariable(CONFIRM_URL, siteUrl + BILLING_URL);
        context.setVariable(CONFIRM_BTN_TEXT, "Check billing");
        mailClient.sendMail("Balance replenished", CONFIRMATION_TEMPLATE, context, MailHolder.MessageType.BILLING, getRecipients(company));
    }


    /*******************************************************************************************************************
     *
     *                                                ADMIN
     *
     ******************************************************************************************************************/

    public void sendBonus(Company company, int amount) {
        Context context = contextTemplate();
        context.setVariable(TITLE, "You have received a bonus from Home Improve");
        context.setVariable(BODY, "Bonus of " + highlight("$" + centsToUsd(amount)) +
            " is added to your Home Improve account balance.");
        context.setVariable(CONFIRM_URL, siteUrl + BILLING_URL);
        context.setVariable(CONFIRM_BTN_TEXT, "Check billing");
        mailClient.sendMail("Bonus from Home Improve", CONFIRMATION_TEMPLATE, context,
            MailHolder.MessageType.NOREPLY, getRecipients(company));
    }

    public void sendInvitation(String email, int amount) {
        Context context = contextTemplate();
        context.setVariable(TITLE, "You have been invited to Home Improve");
        context.setVariable(BODY, "You will receive " + highlight("$" + centsToUsd(amount)) +
            " after " + wrapLink("signing up", siteUrl + BECOME_PRO_URL) + " the Home Improve.");
        context.setVariable(CONFIRM_URL, siteUrl + BECOME_PRO_URL);
        context.setVariable(CONFIRM_BTN_TEXT, "Become a Pro");
        mailClient.sendMail("Bonus from Home Improve", CONFIRMATION_TEMPLATE, context,
            MailHolder.MessageType.NOREPLY, email);
    }


    private String highlight(String phrase) {
        return "<b>" + phrase + "</b>";
    }

    private String wrapLink(String phrase, String link) {
        return "<a href= " + link + ">" + phrase + "</a>";
    }


}
