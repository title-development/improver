package com.improver.model;

import com.improver.entity.CompanyConfig;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

import javax.validation.constraints.Size;

@Data
@Accessors(chain = true)
@NoArgsConstructor
public class ProNotificationSettings {

    // New Leads
    // Email notifications of new leads available for purchase
    private boolean isNewLeads;

    // Lead Receipts
    // Email receipts for leads you manually purchase
    private boolean isLeadReceipts;

    // Customer Reviews
    // Notifications when customers leave you reviews, etc..
    private boolean isReceiveReviews;

    // Suggestions and tips
    // Receive personalized tips and suggestion to success on market
    private boolean isReceiveSuggestions;

    // Marketing
    // Receive emails regarding product and special offers from Home Improve
    private boolean isReceiveMarketing;


    private boolean isQuickReply;

    @Size(max = 500)
    private String replyText;


    public ProNotificationSettings(CompanyConfig.NotificationSettings ns) {
        this.isNewLeads = ns.isNewLeads();
        this.isLeadReceipts = ns.isLeadReceipts();
        this.isReceiveReviews = ns.isReceiveReviews();
        this.isReceiveSuggestions = ns.isReceiveSuggestions();
        this.isReceiveMarketing = ns.isReceiveMarketing();
    }
}
