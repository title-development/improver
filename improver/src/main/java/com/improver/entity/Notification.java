package com.improver.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;
import lombok.experimental.Accessors;

import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.ForeignKey;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import java.time.ZonedDateTime;

import static com.improver.application.properties.Path.*;
import static com.improver.application.properties.UiPath.*;
import static com.improver.util.serializer.SerializationUtil.DATE_TIME_PATTERN;

@Data
@Accessors(chain = true)
@Entity(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private String payload;

    private String icon;

    private String link;

    @JsonFormat(pattern = DATE_TIME_PATTERN)
    private ZonedDateTime created = ZonedDateTime.now();

    private boolean isRead = false;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="user_id",  foreignKey = @ForeignKey(name = "notification_user_fkey"))
    private User user;


    @Deprecated
    public static Notification newProjectMessage(User receiver, String sender, String serviceType, long projectRequestId){
        return new Notification().setUser(receiver)
            .setPayload(String.format("New message from <b>%s</b> on <b>%s</b>", sender, serviceType))
            .setLink(null);
    }


    public static Notification newProjectRequest(User receiver, String company, String companyId, String serviceType, long projectId){
        return new Notification().setUser(receiver)
            .setIcon(companyIconURL(companyId))
            .setPayload(String.format("<b>%s</b> sent you project request for <b>%s</b>", company, serviceType))
            .setLink(CUSTOMER_PROJECTS + projectId);
    }

    public static Notification proLeftProject(User receiver, String company, String companyId, String serviceType, long projectId){
        return new Notification().setUser(receiver)
            .setIcon(companyIconURL(companyId))
            .setPayload(String.format("<b>%s</b> left the project <b>%s</b>", company, serviceType))
            .setLink(CUSTOMER_PROJECTS + projectId);
    }



    public static Notification newLeadPurchase(User receiver, String client, long customerId, String serviceType, long projectRequestId){
        return new Notification().setUser(receiver)
            .setIcon(customerIconURL(customerId))
            .setPayload(String.format("New project request for <b>%s</b> from <b>%s</b>",  serviceType, client))
            .setLink(PRO_PROJECTS + projectRequestId);
    }

    public static Notification customerHired(User receiver, String client, long customerId, String serviceType, long projectRequestId){
        return new Notification().setUser(receiver)
            .setIcon(customerIconURL(customerId))
            .setPayload(String.format("<b>%s</b> hired you for project <b>%s</b>", client, serviceType))
            .setLink(PRO_PROJECTS + projectRequestId);
    }

    public static Notification customerCloseProject(User receiver, String client, long customerId, String serviceType, long projectRequestId){
        return new Notification().setUser(receiver)
            .setIcon(customerIconURL(customerId))
            .setPayload(String.format("<b>%s</b> closed the project <b>%s</b>", client, serviceType))
            .setLink(PRO_PROJECTS + projectRequestId);
    }


    public static Notification reviewed(User receiver, String client, long customerId, String companyId){
        return new Notification().setUser(receiver)
            .setIcon(customerIconURL(customerId))
            .setPayload(String.format("<b>%s</b> left review", client))
            .setLink(COMPANIES + SLASH + companyId + "#reviews");
    }

    public static Notification reviewedNegative(User receiver, String client, long customerId, String companyId){
        return new Notification().setUser(receiver)
            .setIcon(customerIconURL(customerId))
            .setPayload(String.format("You got new review with low rating from <b>%s</b>", client))
            .setLink(COMPANIES + SLASH + companyId + "#reviews");
    }

    public static Notification reviewPublished(User receiver, String client, long customerId, String companyId){
        return new Notification().setUser(receiver)
            .setIcon(customerIconURL(customerId))
            .setPayload(String.format("Review from <b>%s</b> is published on your profile page", client))
            .setLink(COMPANIES + SLASH + companyId + "#reviews");
    }


    public static Notification projectInvalidated(User receiver, String serviceType, long projectId){
        return new Notification().setUser(receiver)
            .setIcon(SYSTEM_NOTIFICATION_ICON)
            .setPayload(String.format("Your <b>%s</b> project has been invalidated", serviceType))
            .setLink(CUSTOMER_PROJECTS + projectId);
    }

    public static Notification projectToValidation(User receiver, String serviceType, long projectId){
        return new Notification().setUser(receiver)
            .setIcon(SYSTEM_NOTIFICATION_ICON)
            .setPayload(String.format("Your <b>%s</b> project has been sent to manual validation", serviceType))
            .setLink(CUSTOMER_PROJECTS + projectId);
    }

    public static Notification projectValidated(User receiver, String serviceType, long projectId){
        return new Notification().setUser(receiver)
            .setIcon(SYSTEM_NOTIFICATION_ICON)
            .setPayload(String.format("Your <b>%s</b> project has been validated", serviceType))
            .setLink(CUSTOMER_PROJECTS + projectId);
    }


    private static String customerIconURL(long customerId){
        return USERS_PATH + SLASH + customerId + ICON;
    }

    private static String companyIconURL(String companyId){
        return COMPANIES_PATH + SLASH + companyId + ICON;
    }
}


