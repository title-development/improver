package com.improver.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

import javax.persistence.*;
import java.time.ZonedDateTime;

import static com.improver.application.properties.Path.*;
import static com.improver.application.properties.UiPath.*;
import static com.improver.util.serializer.SerializationUtil.DATE_TIME_PATTERN;

@Data
@Accessors(chain = true)
@Entity(name = "notifications")
@NoArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long projectId;

    private String payload;

    private String icon;

    private String link;

    @JsonFormat(pattern = DATE_TIME_PATTERN)
    private ZonedDateTime created = ZonedDateTime.now();

    private boolean isRead = false;

    @Transient
    private boolean isNewMessage = false;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="user_id",  foreignKey = @ForeignKey(name = "notification_user_fkey"))
    private User user;

    /**
     * constructor for Customer Message Notification
     * @param projectRequestId
     * @param serviceTypeName
     * @param companyName
     * @param projectId
     * @param companyId
     * @param created
     */
    public Notification(Long projectRequestId, String serviceTypeName, String companyName, Long projectId, long companyId, ZonedDateTime created) {
        this.isNewMessage = true;
        this.icon = companyIconURL(companyId);
        this.link = CUSTOMER_PROJECTS + projectId + "#" + projectRequestId;
        this.payload = String.format("New message from <b>%s</b> in %s", companyName, serviceTypeName);
        this.created = created;
        this.projectId = projectId;
    }

    /**
     * constructor for Contractor Message Notification
     * @param projectRequestId
     * @param serviceTypeName
     * @param customerName
     * @param customerId
     * @param created
     */
    public Notification(Long projectRequestId, String serviceTypeName, String customerName, Long customerId, ZonedDateTime created) {
        this.isNewMessage = true;
        this.icon = customerIconURL(customerId);
        this.link = PRO_PROJECTS + projectRequestId;
        this.payload = String.format("New message from <b>%s</b> in %s", customerName, serviceTypeName);
        this.created = created;
    }

    /********************************************************************************************************
     *                                                  CUSTOMER
     ********************************************************************************************************/

    public static Notification newProjectRequest(User receiver, String company, long companyId, String serviceType, long projectId){
        return new Notification().setUser(receiver)
            .setIcon(companyIconURL(companyId))
            .setProjectId(projectId)
            .setPayload(String.format("<b>%s</b> sent you a project request for %s", company, serviceType))
            .setLink(CUSTOMER_PROJECTS + projectId);
    }

    public static Notification proLeftProject(User receiver, String company, long companyId, String serviceType, long projectId){
        return new Notification().setUser(receiver)
            .setIcon(companyIconURL(companyId))
            .setProjectId(projectId)
            .setPayload(String.format("<b>%s</b> left the %s project", company, serviceType))
            .setLink(CUSTOMER_PROJECTS + projectId);
    }

    public static Notification projectInvalidated(User receiver, String serviceType, long projectId){
        return new Notification().setUser(receiver)
            .setIcon(SYSTEM_NOTIFICATION_ICON)
            .setProjectId(projectId)
            .setPayload(String.format("Project <b>%s</b> has been invalidated", serviceType))
            .setLink(CUSTOMER_PROJECTS + projectId);
    }

    public static Notification projectToValidation(User receiver, String serviceType, long projectId){
        return new Notification().setUser(receiver)
            .setIcon(SYSTEM_NOTIFICATION_ICON)
            .setProjectId(projectId)
            .setPayload(String.format("Project <b>%s</b> sent to validation", serviceType))
            .setLink(CUSTOMER_PROJECTS + projectId);
    }

    public static Notification projectValidated(User receiver, String serviceType, long projectId){
        return new Notification().setUser(receiver)
            .setIcon(SYSTEM_NOTIFICATION_ICON)
            .setProjectId(projectId)
            .setPayload(String.format("Project <b>%s</b> has been validated", serviceType))
            .setLink(CUSTOMER_PROJECTS + projectId);
    }

    /********************************************************************************************************
     *                                                  PRO
     ********************************************************************************************************/

    public static Notification newSubscriptionLeadPurchase(User receiver, String client, long customerId, String serviceType, long projectRequestId){
        return new Notification().setUser(receiver)
            .setIcon(customerIconURL(customerId))
            .setPayload(String.format("New subscription project %s for <b>%s</b>",  serviceType, client))
            .setLink(PRO_PROJECTS + projectRequestId);
    }

    public static Notification customerHired(User receiver, String client, long customerId, String serviceType, long projectRequestId){
        return new Notification().setUser(receiver)
            .setIcon(customerIconURL(customerId))
            .setPayload(String.format("<b>%s</b> accepted your offer in the %s", client, serviceType))
            .setLink(PRO_PROJECTS + projectRequestId);
    }

    public static Notification customerCloseProject(User receiver, String client, long customerId, String serviceType, long projectRequestId){
        return new Notification().setUser(receiver)
            .setIcon(customerIconURL(customerId))
            .setPayload(String.format("<b>%s</b> closed the %s project", client, serviceType))
            .setLink(PRO_PROJECTS + projectRequestId);
    }

    public static Notification reviewed(User receiver, String client, long customerId, long companyId){
        return new Notification().setUser(receiver)
            .setIcon(customerIconURL(customerId))
            .setPayload(String.format("<b>%s</b> left a review", client))
            .setLink(COMPANIES + SLASH + companyId + "#reviews");
    }

    public static Notification reviewedNegative(User receiver, String client, long customerId, long companyId){
        return new Notification().setUser(receiver)
            .setIcon(customerIconURL(customerId))
            .setPayload(String.format("You got a new review with a low rating from <b>%s</b>", client))
            .setLink(COMPANIES + SLASH + companyId + "#reviews");
    }

    public static Notification reviewPublished(User receiver, String client, long customerId, long companyId){
        return new Notification().setUser(receiver)
            .setIcon(customerIconURL(customerId))
            .setPayload(String.format("The review from <b>%s</b> has been published on your profile page", client))
            .setLink(COMPANIES + SLASH + companyId + "#reviews");
    }

    public static Notification bonusReceived(User receiver, int amount){
        return new Notification().setUser(receiver)
            .setIcon(SYSTEM_NOTIFICATION_ICON)
            .setPayload(String.format("You received bonus <b>$%d</b>", amount / 100))
            .setLink(BILLING_URL);
    }

    private static String customerIconURL(long customerId){
        return USERS_PATH + SLASH + customerId + ICON;
    }

    private static String companyIconURL(long companyId){
        return COMPANIES_PATH + SLASH + companyId + ICON;
    }

}


