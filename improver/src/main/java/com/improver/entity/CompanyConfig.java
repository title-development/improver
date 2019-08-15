package com.improver.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

import javax.persistence.Embeddable;
import javax.persistence.Embedded;
import javax.persistence.Entity;
import javax.persistence.ForeignKey;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.OneToOne;
import javax.persistence.Transient;
import java.util.List;

import static com.improver.application.properties.BusinessProperties.DEFAULT_COMPANY_COVERAGE_RADIUS;
import static com.improver.application.properties.BusinessProperties.MAX_REQUEST_REVIEWS;

@Data
@Accessors(chain = true)
@Entity(name = "company_configs")
public class CompanyConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @OneToOne
    @JoinColumn(name="company_id",  foreignKey = @ForeignKey(name = "company_config_fkey"))
    private Company company;

    private int availableReviewRequest = MAX_REQUEST_REVIEWS;

    @Embedded
    private CoverageConfig coverageConfig;

    @Embedded
    private NotificationSettings notificationSettings;

    public static CompanyConfig defaultSettings(Company company) {
        return new CompanyConfig().setCompany(company)
            .setCoverageConfig(CoverageConfig.ofLocation(company.getLocation(), DEFAULT_COMPANY_COVERAGE_RADIUS))
            .setNotificationSettings(new NotificationSettings());

    }

    public CompanyConfig updateCoverageConfigTo(CoverageConfig source){
        this.getCoverageConfig().updateTo(source);
        return this;
    }

    public CompanyConfig updateNotificationSettingTo(NotificationSettings source){
        this.getNotificationSettings().updateTo(source);
        return this;
    }


    @Data @Accessors(chain = true)
    @NoArgsConstructor
    @Embeddable
    public static class CoverageConfig {
        private boolean isManualMode = false;
        private double centerLat = 0;
        private double centerLng = 0;
        private int radius = 0;
        @Transient
        private List<String> zips;


        public static CoverageConfig ofLocation(ExtendedLocation location, int radius){
            return new CoverageConfig().setManualMode(false)
                .setCenterLat(location.getLat())
                .setCenterLng(location.getLng())
                .setRadius(radius);
        }

        public CoverageConfig updateTo(CoverageConfig source){
            this.setManualMode(source.isManualMode())
                .setCenterLat(source.getCenterLat())
                .setCenterLng(source.getCenterLng())
                .setRadius(source.getRadius());
            return this;
        }
    }

    @Data @Accessors(chain = true)
    @Embeddable
    public static class NotificationSettings {

        // New Leads
        // Email notifications of new leads available for purchase
        private boolean isNewLeads = true;

        // Lead Receipts
        // Email receipts for leads you manually purchase
        private boolean isLeadReceipts = true;

        // Customer Reviews
        // Notifications when customers leave you reviews, etc..
        private boolean isReceiveReviews = true;

        // Suggestions and tips
        // Receive personalized tips and suggestion to success on market
        private boolean isReceiveSuggestions = true;

        // Marketing
        // Receive emails regarding updates and special offers from Home Improve
        private boolean isReceiveMarketing = true;


        public NotificationSettings updateTo(NotificationSettings source) {
            this.setNewLeads(source.isNewLeads())
                .setLeadReceipts(source.isLeadReceipts())
                .setReceiveReviews(source.isReceiveReviews())
                .setReceiveMarketing(source.isReceiveMarketing())
                .setReceiveSuggestions(source.isReceiveSuggestions());
            return this;
        }
    }
}



