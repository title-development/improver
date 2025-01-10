package com.improver.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

import jakarta.persistence.*;
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

    public static CompanyConfig defaultSettings(Company company) {
        return new CompanyConfig().setCompany(company)
            .setCoverageConfig(CoverageConfig.ofLocation(company.getExtendedLocation(), DEFAULT_COMPANY_COVERAGE_RADIUS));
    }

    public CompanyConfig updateCoverageConfigTo(CoverageConfig source){
        this.getCoverageConfig().updateTo(source);
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

}



