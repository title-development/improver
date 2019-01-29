package com.improver.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;
import lombok.experimental.Accessors;
import org.hibernate.annotations.GenericGenerator;
import javax.validation.constraints.Email;

import javax.persistence.*;
import javax.validation.constraints.Pattern;
import java.time.ZonedDateTime;
import java.util.List;

import static com.improver.util.database.DataAccessUtil.*;
import static com.improver.util.serializer.SerializationUtil.PHONE_PATTERN_STRING;

@Data
@Accessors(chain = true)
@Entity(name = "companies")
public class Company {

    @Id
    @GeneratedValue(generator = UUID_GENERATOR_NAME)
    @GenericGenerator(name = UUID_GENERATOR_NAME, strategy = UUID_NAME)
    private String id;

    private String uri;

    @Column(nullable = false, unique = true)
    private String name;

    private String iconUrl;

    private String backgroundUrl;

    @Column(length = COMPANY_DESCRIPTION_MAX_SIZE)
    private String description;

    @Embedded
    private ExtendedLocation location;

    @Email
    private String email;

    @Pattern(regexp = PHONE_PATTERN_STRING)
    private String internalPhone;

    private int founded;

    @Column(columnDefinition = CD_INTEGER)
    private int reviewCount = 0;

    @Column(columnDefinition = CD_DOUBLE)
    private double rating = 0;

    @Column(columnDefinition = CD_LONG)
    private long sumRating = 0;

    private String siteUrl;

    @Column(columnDefinition = CD_BOOLEAN)
    private boolean isApproved;

    @JsonIgnore
    @OneToMany(mappedBy = "company")
    private List<Contractor> contractors;

    @JsonIgnore
    @OneToMany(mappedBy = "company")
    private List<UnavailabilityPeriod> unavailabilityPeriods;

    @JsonIgnore
    @ManyToMany
    @JoinTable(name="company_service_types",
        joinColumns=@JoinColumn(name="company_id", referencedColumnName="id"),
        inverseJoinColumns=@JoinColumn(name="service_type_id", referencedColumnName="id"))
    private List<ServiceType> serviceTypes;

    @JsonIgnore
    @ManyToMany
    @JoinTable(name="company_trades",
        joinColumns=@JoinColumn(name="company_id", referencedColumnName="id"),
        inverseJoinColumns=@JoinColumn(name="trade_id", referencedColumnName="id"))
    private List<Trade> trades;

    @JsonIgnore
    @OneToMany(mappedBy = "company")
    private List<Area> areas;

    @OneToMany(mappedBy = "company")
    private List<License> licenses;

    @JsonIgnore
    @OneToMany(mappedBy = "company")
    private List<GalleryProject> galleryProjects;

    @JsonIgnore
    @OneToMany(mappedBy = "company")
    private List<Review> reviews;

    @JsonIgnore
    @OneToMany(mappedBy = "company")
    private List<Transaction> transactions;

    @OneToOne(mappedBy = "company", fetch = FetchType.LAZY)
    private Billing billing;

    @JsonIgnore
    @OneToMany(mappedBy = "company")
    private List<CompanyAction> actions;

    private ZonedDateTime created;

    private ZonedDateTime updated;

    @Column(columnDefinition = CD_BOOLEAN)
    private boolean isDeleted = false;

    @JsonIgnore
    @OneToOne(mappedBy = "company", fetch = FetchType.LAZY)
    private CompanyConfig companyConfig;


    @Column(columnDefinition = CD_INTEGER)
    private int medianProjectCost = 0;


    public Company setEmail(String email) {
        this.email = email.toLowerCase();
        return this;
    }


    public Company update(Company source) {
        return this.setName(source.getName())
            .setUri(source.getUri())
            .setIconUrl(source.getIconUrl())
            .setBackgroundUrl(source.getBackgroundUrl())
            .setDescription(source.getDescription())
            .setLocation(source.getLocation())
            .setEmail(source.getEmail())
            .setInternalPhone(source.getInternalPhone())
            .setFounded(source.getFounded());
    }

}
