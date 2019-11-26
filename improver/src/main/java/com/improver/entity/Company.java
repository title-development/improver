package com.improver.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.improver.model.in.registration.CompanyDetails;
import lombok.Data;
import lombok.ToString;
import lombok.experimental.Accessors;

import javax.persistence.*;
import java.time.ZonedDateTime;
import java.util.List;

import static com.improver.util.database.DataAccessUtil.*;

@Data
@Accessors(chain = true)
@Entity(name = "companies")
//@Table(name = "companies")
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Deprecated
    private String uri;

    @Column(nullable = false, unique = true)
    private String name;

    private String iconUrl;

    private String backgroundUrl;

    @Column(length = COMPANY_DESCRIPTION_MAX_SIZE)
    private String description;

    @Embedded
    private ExtendedLocation location;

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

    @ToString.Exclude
    @JsonIgnore
    @OneToMany(mappedBy = "company")
    private List<Contractor> contractors;

    @ToString.Exclude
    @JsonIgnore
    @OneToMany(mappedBy = "company")
    private List<UnavailabilityPeriod> unavailabilityPeriods;

    @ToString.Exclude
    @JsonIgnore
    @ManyToMany
    @JoinTable(name="company_service_types",
        joinColumns=@JoinColumn(name="company_id", referencedColumnName="id"),
        inverseJoinColumns=@JoinColumn(name="service_type_id", referencedColumnName="id"))
    private List<ServiceType> serviceTypes;

    @ToString.Exclude
    @JsonIgnore
    @ManyToMany
    @JoinTable(name="company_trades",
        joinColumns=@JoinColumn(name="company_id", referencedColumnName="id"),
        inverseJoinColumns=@JoinColumn(name="trade_id", referencedColumnName="id"))
    private List<Trade> trades;

    @ToString.Exclude
    @JsonIgnore
    @OneToMany(mappedBy = "company")
    private List<Area> areas;

    @ToString.Exclude
    @OneToMany(mappedBy = "company")
    private List<License> licenses;

    @ToString.Exclude
    @JsonIgnore
    @OneToMany(mappedBy = "company")
    private List<DemoProject> demoProjects;

    @ToString.Exclude
    @JsonIgnore
    @OneToMany(mappedBy = "company")
    private List<Review> reviews;

    @ToString.Exclude
    @JsonIgnore
    @OneToMany(mappedBy = "company")
    private List<Transaction> transactions;

    @ToString.Exclude
    @OneToOne(mappedBy = "company", fetch = FetchType.LAZY)
    private Billing billing;

    @ToString.Exclude
    @JsonIgnore
    @OneToMany(mappedBy = "company")
    private List<CompanyAction> actions;

    //@Column(columnDefinition= "TIMESTAMP")
    private ZonedDateTime created;

    //@Column(columnDefinition= "TIMESTAMP")
    private ZonedDateTime updated;

    @Column(columnDefinition = CD_BOOLEAN)
    private boolean isDeleted = false;

    @ToString.Exclude
    @JsonIgnore
    @OneToOne(mappedBy = "company", fetch = FetchType.LAZY)
    private CompanyConfig companyConfig;



    public static Company of(CompanyDetails details, String iconUrl, ZonedDateTime created){
        return new Company().setName(details.getName())
            .setDescription(details.getDescription())
            .setIconUrl(iconUrl)
            .setFounded(details.getFounded())
            .setSiteUrl(details.getSiteUrl())
            .setLocation(details.getLocation())
            .setCreated(created)
            .setUpdated(created);
    }


}
