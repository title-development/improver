package com.improver.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonRawValue;
import com.improver.util.ImageContainable;
import com.improver.util.serializer.SerializationUtil;
import lombok.Data;
import lombok.experimental.Accessors;

import javax.persistence.*;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.List;

import static com.improver.util.database.DataAccessUtil.CD_INTEGER;
import static com.improver.util.serializer.SerializationUtil.DATE_PATTERN;

@Data
@Accessors(chain = true)
@Entity(name = "gallery_projects")
public class GalleryProject implements ImageContainable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name="company_id",  foreignKey = @ForeignKey(name = "gallery_project_company_fkey"))
    private Company company;

    private String name;

    @Column(columnDefinition = "varchar(1500)")
    private String description;

    @JsonFormat(pattern = DATE_PATTERN)
    private LocalDate date;

    @Column(columnDefinition = CD_INTEGER)
    private int price = 0;

    @Embedded
    private Location location;

    @JsonIgnore
    private String services;

    private String coverUrl;

    private ZonedDateTime updated;

    private ZonedDateTime created = ZonedDateTime.now();

    @JsonIgnore
    @OneToMany(mappedBy = "galleryProject", cascade = CascadeType.REMOVE)
    private List<CompanyImage> companyImages;



    public GalleryProject setServiceTypes(List<String> serviceTypes){
        this.services = SerializationUtil.toJson(serviceTypes);
        return this;
    }

    @JsonRawValue
    public String getServiceTypes() {
        return services;
    }


    @Override
    public GalleryProject setCoverUrl(String imageCoverUrl) {
        this.coverUrl = imageCoverUrl;
        return this;
    }

    @Override
    public String getCoverUrl() {
        return this.coverUrl;
    }
}
