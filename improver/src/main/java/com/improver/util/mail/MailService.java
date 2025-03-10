package com.improver.util.mail;

import com.fasterxml.jackson.core.type.TypeReference;
import com.improver.application.properties.BusinessProperties;
import com.improver.entity.*;
import com.improver.model.in.Order;
import com.improver.model.out.billing.PaymentCard;
import com.improver.model.tmp.UnreadProjectMessageInfo;
import com.improver.repository.AdminRepository;
import com.improver.security.JwtUtil;
import com.improver.service.PaymentService;
import com.improver.util.serializer.SerializationUtil;
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
import java.util.List;
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
    private static final String THANK_YOU_FOR_JOIN = "Thank you for joining Home Improve!";
    private static final String HOME_IMPROVE = "Home Improve";

    // Email Subjects
    private static final String SBJ_CONFIRM_REGISTRATION = " Confirm your registration";

    // Templates
    private static final String NOTICE_TEMPLATE = "user/notice";
    private static final String CONFIRMATION_TEMPLATE = "user/confirmation";
    private static final String PROJECT_DETAILS_TEMPLATE = "user/projectDetails";
    private static final String TEXT_AREA_TEMPLATE = "user/textArea";
    private static final String CONFIRMATION_STAFF_TEMPLATE = "staff/confirmation";

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

    @Autowired private MailClient mailClient;
    @Autowired private TemplateEngine templateEngine;
    @Autowired private PaymentService paymentService;
    @Autowired private AdminRepository adminRepository;
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
        context.setVariable(BODY, "If you did not authorize this action please contact support immediately");
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
        context.setVariable(BODY, "You requested a password reset. For the next step, click the link below.");
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
        context.setVariable(TITLE, "You've requested an account email change");
        context.setVariable(BODY, "Please confirm your new account email. If you didn't do this action, please ignore this mail.");
        String pageUrl = siteUrl + CONFIRM + EMAIL;
        context.setVariable(CONFIRM_URL, pageUrl + SLASH + jwtUtil.generateActivationJWT(user.getValidationKey(), user.getNewEmail()));
        context.setVariable(CONFIRM_BTN_TEXT, "Confirm");
        mailClient.sendMail("Request to change account email", CONFIRMATION_TEMPLATE, context, MailHolder.MessageType.NOREPLY, user.getNewEmail());
    }


    /**
     * Send notice email to User that has been changed his email address. Notice will be sent to his old email address.
     *
     * @param user user that has been changed his email address
     */
    public void sendEmailChangedNotice(User user) {
        Context context = contextTemplate();
        context.setVariable(USER_NAME, user.getFirstName());
        context.setVariable(TITLE, "You've requested an account email change to " + user.getNewEmail());
        context.setVariable(BODY, "Please check " + user.getNewEmail() + " mailbox and click on the link provided to confirm your new account email." +
            "<br/>If you did not authorize this action please contact support.");
        mailClient.sendMail("Request to change account email", NOTICE_TEMPLATE, context, MailHolder.MessageType.NOREPLY, user.getEmail());
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
     * Send email to User that his account has been blocked/unblocked
     *
     * @param user user whose account has been blocked/unblocked
     */
    public void sendBlockAccount(User user) {
        Context context = contextTemplate();
        context.setVariable(USER_NAME, user.getFirstName());
        String newStatus = user.isBlocked() ? "blocked" : "unblocked";
        String title = "Your account has been " + newStatus;
        StringBuilder body = new StringBuilder("Your Home Improve account has been ");
        body.append(newStatus);
        body.append(".");
        if (user.isBlocked()) {
            body.append(" You can contact with a support team to appeal the decision.");
        }
        context.setVariable(TITLE, title);
        context.setVariable(BODY, body);
        mailClient.sendMail("Account has been " + newStatus, NOTICE_TEMPLATE, context, MailHolder.MessageType.NOREPLY, user.getEmail());
    }

    public void sendUnreadMessageNotificationEmails(String email, List<UnreadProjectMessageInfo> unreadProjectMessageInfos, boolean isForCustomers) {
        for (UnreadProjectMessageInfo message: unreadProjectMessageInfos){
            String userProjectRequestPath;
            Context context = contextTemplate();
            String title = "You have new messages";
            StringBuilder body = new StringBuilder();
            if (isForCustomers) {
                userProjectRequestPath = siteUrl + CUSTOMER_PROJECTS + message.getProjectId() + "#" + message.getProjectRequestId();
                    body.append(String.format("You have new messages from %1$s in %2$s project <br>",
                        message.getCompanyName(), message.getServiceTypeName()));
                context.setVariable(CONFIRM_URL, userProjectRequestPath);
            } else {
                userProjectRequestPath = siteUrl + PRO_PROJECTS + message.getProjectRequestId();
                    body.append(String.format("You have new messages from %1$s in %2$s project <br>",
                        message.getClientName(), message.getServiceTypeName()));
                context.setVariable(CONFIRM_URL, userProjectRequestPath);
            }
            context.setVariable(TITLE, title);
            context.setVariable(BODY, body);
            context.setVariable(CONFIRM_BTN_TEXT, "View Conversation");
            mailClient.sendMail("You have new messages", CONFIRMATION_TEMPLATE, context, MailHolder.MessageType.NOREPLY, email);
        }

    }

    /********************************************************************************************************
     *                                                  CUSTOMER
     ********************************************************************************************************/

    public void sendAutoRegistrationConfirmEmail(Customer customer, Project project, boolean showAnswers, boolean isSocialUser) {
        Context context = contextTemplate();
        context.setVariable(USER_NAME, customer.getFirstName());
        context.setVariable(TITLE, "Thank you for choosing Home Improve!");
        context.setVariable("serviceType", project.getServiceName());
        context.setVariable(BODY, "You've requested request a " + project.getServiceName());
        context.setVariable("location", project.getLocation());
        context.setVariable("startExpectation", project.getStartDate());
        context.setVariable("notes", project.getNotes());
        if (showAnswers){
            List<Order.QuestionAnswer> questionAnswers = SerializationUtil.fromJson(new TypeReference<>() {}, project.getDetails());
            context.setVariable("answers", questionAnswers);
        }
        context.setVariable("message", "We've created a cabinet where you can manage your project and discuss details with Professionals. " +
            "Please confirm you email so we can start searching the best Professionals for your project. "  +
            "<br/> If you didn't do this action, please ignore this mail.");
        context.setVariable(CONFIRM_URL, siteUrl + CONFIRM + (isSocialUser ? ACTIVATION : PASSWORD) + SLASH +
            jwtUtil.generateActivationJWT(customer.getValidationKey(), customer.getEmail()));
        context.setVariable(CONFIRM_BTN_TEXT, "Confirm");
        mailClient.sendMail(SBJ_CONFIRM_REGISTRATION, PROJECT_DETAILS_TEMPLATE, context, MailHolder.MessageType.NOREPLY, customer.getEmail());
    }


    public void sendOrderSubmitMail(Customer customer, Project project, boolean showAnswers) {
        Context context = contextTemplate();
        context.setVariable(USER_NAME, customer.getFirstName());
        context.setVariable(TITLE, "Your project has been submitted!");
        context.setVariable(BODY, "You've requested a " + project.getServiceName()  + ".");
        context.setVariable("location", project.getLocation());
        context.setVariable("startExpectation", project.getStartDate());
        context.setVariable("notes", project.getNotes());
        if (showAnswers){
            List<Order.QuestionAnswer> questionAnswers = SerializationUtil.fromJson(new TypeReference<>() {}, project.getDetails());
            context.setVariable("answers", questionAnswers);
        }
        context.setVariable("message", "We’re looking for the best Pros for your project. " +
            "This usually takes a few minutes. To view your project request please proceed to Home Improve.");
        context.setVariable(CONFIRM_URL, siteUrl + CUSTOMER_PROJECTS + project.getId());
        context.setVariable(CONFIRM_BTN_TEXT, "View project");
        mailClient.sendMail("Your project has been submitted", PROJECT_DETAILS_TEMPLATE, context, MailHolder.MessageType.NOREPLY, customer.getEmail());
    }

    /**
     * Send email about new request form Contractor.
     *
     * @param company contractor that purchased lead
     * @param project project that is purchased
     */
    public void sendNewProjectRequestEmail(Company company, Project project) {
        Customer customer = project.getCustomer();
        Context context = contextTemplate();
        context.setVariable(USER_NAME, customer.getFirstName());
        context.setVariable(TITLE, "You have new project request");
        context.setVariable(BODY, "New request from " + company.getName() + " on " +
            project.getServiceName());
        context.setVariable(CONFIRM_URL, siteUrl + CUSTOMER_PROJECTS + project.getId());
        context.setVariable(CONFIRM_BTN_TEXT, "View project");
        mailClient.sendMail("New project request from " + company.getName(), CONFIRMATION_TEMPLATE, context, MailHolder.MessageType.NOREPLY, customer.getEmail());
    }


    public void sendReviewRevisionRequest(Company company, Review review, String serviceType, String comment) {
        Context context = contextTemplate();
        String publishDate = review.getPublishDate().format(DateTimeFormatter.ISO_LOCAL_DATE);
        context.setVariable(TITLE, "Your have new review revision request");
        context.setVariable(BODY_BEFORE_AREA, String.format("%s would like you to revise your review on %s project. Till %s the Pro may contact you to fix outstanding problems if any.",
            company.getName(), serviceType, highlight(publishDate)));
        context.setVariable(TEXT_AREA_TITLE,"Message from Pro:");
        context.setVariable(TEXT_AREA_CONTENT, comment);
        context.setVariable(BODY_AFTER_AREA, String.format("Revision request expires on %1$s and if you would not revise it, your original review won't be changed." +
            "<br/>We may send you a reminder if you haven't responded before %s.", highlight(publishDate)));
        context.setVariable(CONFIRM_URL, siteUrl + UI_CUSTOMER_BASE_PATH + "/review-revision/" + review.getId());
        context.setVariable(CONFIRM_BTN_TEXT, "Edit review");
        mailClient.sendMail("Review revision request", TEXT_AREA_TEMPLATE, context, MailHolder.MessageType.NOREPLY, review.getCustomer().getEmail());
    }


    public void sendProjectStatusChanged(Project project, Project.Reason reason) {
        Customer customer = project.getCustomer();
        Context context = contextTemplate();
        context.setVariable(USER_NAME, customer.getFirstName());
        context.setVariable(TITLE, "Project status changed");
        StringBuilder body = new StringBuilder("Your ").append(project.getServiceName()).append(" project has been");
        switch (project.getStatus()){
            case INVALID:
                body.append(" invalidated.");
                break;
            case VALIDATION:
                body.append(" sent to validation.");
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


    public void sendTicketSubmitted(Ticket ticket) {
        Context context = contextTemplate();
        context.setVariable(TITLE, "Ticket is submitted");
        context.setVariable(BODY,highlight("Subject: ") + ticket.getSubject().getValue() + "<br/>" +
            highlight("Comment: ") + ticket.getDescription() + "<br/><br/>" +
            "Your request has been received, and is being reviewed by our support staff.<br>" +
            "Normal Home Improve support hours are Monday through Friday 10am to 5pm PST, and we're closed on major holidays. " +
            "Our support staff is not able to respond to requests outside those hours, and we answer requests in the order received.<br>" +
            "We do our best to respond to requests within 1-4 business days of receipt, but response times may be longer during periods of heavy request traffic. " +
            "We appreciate your patience and will be in touch as soon as possible.");
        mailClient.sendMail("Ticket is submitted", NOTICE_TEMPLATE, context, MailHolder.MessageType.NOREPLY, ticket.getEmail());
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
        mailClient.sendMail("Rate " + pro.getCompany().getName(), CONFIRMATION_TEMPLATE, context, MailHolder.MessageType.NOREPLY, email);
    }

    /**
     * Send email with unreviewed project requests
     *
     * @param company           company to review
     * @param projectRequest    projectRequest to review
     * @param email             Recipient email
     */
    public void sendNewRequestReview(Company company, ProjectRequest projectRequest, String email) {
        Context context = contextTemplate();
        String messageText = String.format("Could you please share your experience with %s on your recent project %s? It only takes a few seconds, and would really help us.", company.getName(), projectRequest.getProject().getServiceName());
        context.setVariable(TITLE, String.format("How was your experience with %s?", company.getName()));
        context.setVariable(BODY, messageText);
        context.setVariable(CONFIRM_URL, siteUrl + UI_CUSTOMER_BASE_PATH + PROJECTS + SLASH + projectRequest.getProject().getId() + "#" + projectRequest.getId());
        context.setVariable(CONFIRM_BTN_TEXT, "Leave a review");
        mailClient.sendMail("Rate " + company.getName(), CONFIRMATION_TEMPLATE, context, MailHolder.MessageType.NOREPLY, email);
    }

    /**
     * Send purchase confirmation email to contractor.
     *
     * @param contractor     contractor that purchased lead
     * @param projectRequest projectRequest created after purchase
     */
    public void sendManualLeadPurchaseEmail(Contractor contractor, ProjectRequest projectRequest) {
        Context context = contextTemplate();
        Project project = projectRequest.getProject();
        context.setVariable(USER_NAME, contractor.getFirstName());
        context.setVariable(TITLE, "You've purchased new lead");
        context.setVariable(BODY, project.getServiceName() + " request from " + project.getCustomer().getDisplayName());
        context.setVariable(CONFIRM_URL, siteUrl + PRO_PROJECTS + projectRequest.getId());
        context.setVariable(CONFIRM_BTN_TEXT, "View project");
        mailClient.sendMail("Lead purchase", CONFIRMATION_TEMPLATE, context, MailHolder.MessageType.BILLING, contractor.getEmail());
    }

    /**
     * Send purchase confirmation email to contractor.
     *
     * @param company            contractor that purchased lead
     * @param projectRequest     projectRequest created after purchase
     * @param answers            lead question answer from questionary form
     * @param showAnswers        add answers to context
     */
    public void sendLeadAutoPurchaseEmail(Company company, Project project, ProjectRequest projectRequest, List<Order.QuestionAnswer> answers, boolean showAnswers) {
        Context context = contextTemplate();
        context.setVariable(USER_NAME, projectRequest.getContractor().getDisplayName());
        context.setVariable(TITLE, "You received new subscription lead");
        context.setVariable(BODY, project.getServiceName() + " request from " + project.getCustomer().getDisplayName());
        context.setVariable("location", project.getLocation());
        context.setVariable("startExpectation", project.getStartDate());
        context.setVariable("notes", project.getNotes());
        if (showAnswers){
            context.setVariable("answers", answers);
        }
        context.setVariable(CONFIRM_URL, siteUrl + PRO_PROJECTS + projectRequest.getId());
        context.setVariable(CONFIRM_BTN_TEXT, "View project");
        mailClient.sendMail("New subscription lead", PROJECT_DETAILS_TEMPLATE, context, MailHolder.MessageType.BILLING, getRecipients(company));
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
        context.setVariable(TITLE, "Your offer accepted");
        context.setVariable(BODY, project.getCustomer().getDisplayName() + " accepted your offer on the " +
            project.getServiceName() + " project");
        context.setVariable(CONFIRM_URL, siteUrl + PRO_PROJECTS + projectRequest.getId());
        context.setVariable(CONFIRM_BTN_TEXT, "View project");
        mailClient.sendMail("Your offer accepted", CONFIRMATION_TEMPLATE, context, MailHolder.MessageType.NOREPLY, contractor.getEmail());
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
            " until the end of the current billing period (" + highlight(endDate) + ").");
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

    public void sendSubscriptionEnded(Company company) {
        Context context = contextTemplate();
        String date = ZonedDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE);
        context.setVariable(TITLE, "Subscription has expired");
        context.setVariable(BODY, "Your monthly subscription has expired on " + highlight(date) + ".");
        context.setVariable(CONFIRM_URL, siteUrl + BILLING_URL);
        context.setVariable(CONFIRM_BTN_TEXT, "Check billing");
        mailClient.sendMail("Subscription for Home Improve has expired", CONFIRMATION_TEMPLATE, context, MailHolder.MessageType.BILLING, getRecipients(company));
    }

    private String getLast4DigitsSilent(Company company) {
        PaymentCard card = paymentService.getDefaultCard(company);
        return Optional.ofNullable(card).map(PaymentCard::getLast4).
            orElse("not defined");
    }


    public void sendSubscriptionProlongation(Company company, int charged, int budget, ZonedDateTime nextBillingDate) {
        Context context = contextTemplate();
        String subject;
        String date = nextBillingDate.format(DateTimeFormatter.ISO_LOCAL_DATE);
        String last4digits = getLast4DigitsSilent(company);

        context.setVariable(TITLE, "Subscription is continued for next billing period");
        StringBuilder body = new StringBuilder("Thank you for being a member of Home Improve. ");
        if (charged > 0) {
            subject = "Successful payment for Home Improve subscription";
            body.append("We successfully charged ").append(highlight(formatUsd(charged)))
                .append(" to your credit card ending in ").append(last4digits)
                .append(" to fulfill Subscription Budget of $").append(SerializationUtil.centsToUsd(budget));
        } else {
            subject = "Subscription continued";
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
        context.setVariable(TITLE, "Return credit request accepted to review");
        context.setVariable(BODY, String.format("Return credit request for the project \"%s for %s\" is accepted to review." +
                " We may contact you to clarify some details regarding this project." +
                " You can track the status of your return credit request in the PRO Dashboard.",
            serviceType, customer));
        context.setVariable(CONFIRM_URL, siteUrl + PRO + DASHBOARD);
        context.setVariable(CONFIRM_BTN_TEXT, "View in Dashboard");
        mailClient.sendMail("Return credit request in review", CONFIRMATION_TEMPLATE, context, MailHolder.MessageType.NOREPLY, getRecipients(company));
    }


    public void sendRefundRequestApproved(Company company, String customer, String serviceType) {
        Context context = contextTemplate();
        context.setVariable(TITLE, "Return credit request is approved");
        context.setVariable(BODY, String.format("Return credit request for the project \"%s for %s\" is approved." +
                " We will credit back the lead price to you internal balance at Home Improve",
            serviceType, customer));
        mailClient.sendMail("Return credit request is approved", NOTICE_TEMPLATE, context, MailHolder.MessageType.NOREPLY, getRecipients(company));
    }


    public void sendRefundRequestRejected(Company company, String customer, String serviceType) {
        Context context = contextTemplate();
        context.setVariable(TITLE, "Return credit request is rejected");
        context.setVariable(BODY, String.format("Return credit request for the project \"%s for %s\" is rejected according to Home Improve's %s",
            serviceType, customer, wrapLink("Lead Return Credit Policy", siteUrl + TERMS_OF_USE_URL)));
        mailClient.sendMail("Return credit request is rejected", NOTICE_TEMPLATE, context, MailHolder.MessageType.NOREPLY, getRecipients(company));
    }

    public void sendNewReviewReceivedMail(Company company, Review review) {
        Context context = contextTemplate();
        context.setVariable(TITLE, "Your company received a new review");
        context.setVariable(BODY_BEFORE_AREA, String.format("%s has been rated with %d star(s) by %s" ,
            company.getName(), review.getScore(), review.getCustomer().getDisplayName()));
        context.setVariable(TEXT_AREA_TITLE,"Review comment:");
        context.setVariable(TEXT_AREA_CONTENT, review.getDescription());
        context.setVariable(CONFIRM_URL, siteUrl + COMPANIES + SLASH + company.getId());
        context.setVariable(CONFIRM_BTN_TEXT, "View at Profile");
        mailClient.sendMail("New review is received", TEXT_AREA_TEMPLATE, context, MailHolder.MessageType.NOREPLY, getRecipients(company));
    }

    public void sendReviewPublishedMail(Company company, Review review) {
        Context context = contextTemplate();
        context.setVariable(TITLE, "A review has been published");
        context.setVariable(BODY_BEFORE_AREA, String.format("A review from %s with rating of %s star(s) has been published at %s profile page",
            review.getCustomer().getDisplayName(), String.valueOf(review.getScore()), company.getName()));
        context.setVariable(TEXT_AREA_TITLE,"Review comment:");
        context.setVariable(TEXT_AREA_CONTENT, review.getDescription());
        context.setVariable(CONFIRM_URL, siteUrl + COMPANIES + SLASH + company.getId());
        context.setVariable(CONFIRM_BTN_TEXT, "View at Profile");
        mailClient.sendMail("Review is published", TEXT_AREA_TEMPLATE, context, MailHolder.MessageType.NOREPLY, getRecipients(company));
    }

    public void sendNewNegativeReviewMail(Company company, Review review, Customer customer) {
        Context context = contextTemplate();
        String publishDate = review.getPublishDate().format(DateTimeFormatter.ISO_LOCAL_DATE);
        context.setVariable(TITLE, "Your company has received a low rating review");
        context.setVariable(BODY_BEFORE_AREA, String.format("%1$s has been rated with %4$s star(s) by %2$s." +
                " A low rating review will not be published on your profile page until %3$s.",
            company.getName(), customer.getDisplayName(), highlight(publishDate), review.getScore()));
        context.setVariable(TEXT_AREA_TITLE,"Review comment:");
        context.setVariable(TEXT_AREA_CONTENT, review.getDescription());
        context.setVariable(BODY_AFTER_AREA, String.format("You can ask client for review revision till publishing date." +
                " Client cannot rate you lower than original review. We recommend to get in touch with %1$s and try to fix outstanding issues if any." +

                "<br/><br/>If the client accepts your request, the revised review will be published on your profile." +
                "<br/>If the client declines your request, or does not respond before %2$s, the original review will be published." +
                "<br/>We'll let you know the client’s decision immediately by email. Regardless of the outcome of your request, please respect the client’s decision." ,
            customer.getDisplayName(), highlight(publishDate)));
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
        return company.getContractors().stream()
            .map(User::getEmail)
            .toArray(String[]::new);
    }

    public void sendBalanceTopUp(Company company, int amount) {
        Context context = contextTemplate();
        context.setVariable(TITLE, "Balance top-up");
        context.setVariable(BODY, "You top up the balance by " + highlight(formatUsd(amount)) + ".");
        context.setVariable(CONFIRM_URL, siteUrl + BILLING_URL);
        context.setVariable(CONFIRM_BTN_TEXT, "Check billing");
        mailClient.sendMail("Balance top-up", CONFIRMATION_TEMPLATE, context, MailHolder.MessageType.BILLING, getRecipients(company));
    }


    /*******************************************************************************************************************
     *
     *                                                STAFF (ADMIN, SUPPORT)
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

    public void sendInvitations(int amount, String... emails) {
        Context context = contextTemplate();
        context.setVariable(TITLE, "You have been invited to Home Improve");
        context.setVariable(BODY, "You will receive " + highlight("$" + centsToUsd(amount)) +
            " after " + wrapLink("signing up", siteUrl + BECOME_PRO_URL) + " at Home Improve.");
        context.setVariable(CONFIRM_URL, siteUrl + BECOME_PRO_URL);
        context.setVariable(CONFIRM_BTN_TEXT, "Become a Pro");
        mailClient.sendMailsSeparate("Bonus from Home Improve", CONFIRMATION_TEMPLATE, context,
            MailHolder.MessageType.NOREPLY, emails);
    }

    public void sendNewTicketReceived(Ticket ticket) {
        Context context = contextTemplate();
        context.setVariable(TITLE, "New ticket is received");
        addTicketToContext(context, ticket);
        String [] emails  = (String[]) adminRepository.findAll().stream().map(Admin::getEmail).toArray();
        mailClient.sendMail("New ticket is received", CONFIRMATION_STAFF_TEMPLATE, context, MailHolder.MessageType.NOREPLY, emails);
    }

    public void sendNewTicketAssignee(Ticket ticket) {
        Context context = contextTemplate();
        context.setVariable(TITLE, "You have new assigned ticket");
        addTicketToContext(context, ticket);
        mailClient.sendMail("New ticket", CONFIRMATION_STAFF_TEMPLATE, context, MailHolder.MessageType.NOREPLY, ticket.getAssignee().getEmail());
    }

    private Context addTicketToContext(Context context, Ticket ticket) {
        String ticketAuthor = ticket.getEmail();
        if (ticket.getAuthor() != null) {
            ticketAuthor = ticket.getAuthor().getEmail();
        }
        context.setVariable(BODY,highlight("Subject: ") + ticket.getSubject().toString() + "<br>"
            + highlight("Author: ") + ticketAuthor + "<br>"
            + highlight("Comment: ") + ticket.getDescription());
        context.setVariable(CONFIRM_URL, siteUrl + MY_STAFF_TICKETS);
        context.setVariable(CONFIRM_BTN_TEXT, "View at dashboard");
        return context;
    }

    private String highlight(String phrase) {
        return "<b>" + phrase + "</b>";
    }

    private String wrapLink(String phrase, String link) {
        return "<a href= " + link + ">" + phrase + "</a>";
    }


}
