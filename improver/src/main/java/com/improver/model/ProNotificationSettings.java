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
    private boolean isReceiveNewLeads;

    // Messages
    // Receive emails about new chat messages
    private boolean isReceiveMessages;

    // Marketing
    // Receive emails regarding updates and special offers from Home Improve
    private boolean isReceiveMarketing;

    // Suggestions and tips
    // Receive personalized tips and suggestion to success on market
    private boolean isReceiveSuggestions;

    private boolean isQuickReply;

    @Size(max = 500)
    private String replyText;

    public ProNotificationSettings(CompanyConfig.NotificationSettings ns) {
        this.isReceiveNewLeads = ns.isReceiveNewLeads();
        this.isReceiveMessages = ns.isReceiveMessages();
        this.isReceiveMarketing = ns.isReceiveMarketing();
        this.isReceiveSuggestions = ns.isReceiveSuggestions();
    }
}
