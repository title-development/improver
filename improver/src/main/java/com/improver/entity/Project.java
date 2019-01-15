package com.improver.entity;


import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonRawValue;
import com.improver.util.ImageContainable;
import lombok.Data;
import lombok.experimental.Accessors;

import javax.persistence.*;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static com.improver.entity.Project.Reason.DONE;
import static com.improver.entity.Project.Reason.DO_MYSELF;
import static com.improver.entity.Project.Reason.DUPLICATED;
import static com.improver.entity.Project.Reason.ESTIMATED;
import static com.improver.entity.Project.Reason.EVALUATING;
import static com.improver.entity.Project.Reason.HIRE_OTHER;
import static com.improver.entity.Project.Reason.INVALID_LOCATION;
import static com.improver.entity.Project.Reason.INVALID_SERVICE;
import static com.improver.entity.Project.Reason.INVALID_USER;
import static com.improver.entity.Project.Reason.OTHER;
import static com.improver.entity.Project.Reason.TOO_EXPENSIVE;
import static com.improver.util.database.DataAccessUtil.ORDER_DESCRIPTION_SIZE;
import static com.improver.util.serializer.SerializationUtil.DATE_TIME_PATTERN;

@Data
@Accessors(chain = true)
@Entity(name = "projects")
public class Project implements ImageContainable {

    public static final int MAX_CONNECTIONS = 4;
    public static final int SUBS_MAX_CONNECTIONS = MAX_CONNECTIONS - 1;


    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @ManyToOne
    @JoinColumn(name="service_type_id",  foreignKey = @ForeignKey(name = "project_service_fkey"))
    private ServiceType serviceType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="customer_id",  foreignKey = @ForeignKey(name = "project_customer_fkey"))
    private Customer customer;

    @Embedded
    private Location location;

    @Column(columnDefinition = "varchar(" + ORDER_DESCRIPTION_SIZE + ")")
    private String notes;

    private String startDate;

    @JsonRawValue
    @Column(columnDefinition = "varchar(16000)")
    private String details;

    @JsonFormat(pattern = DATE_TIME_PATTERN)
    private ZonedDateTime created;

    @JsonFormat(pattern = DATE_TIME_PATTERN)
    private ZonedDateTime updated;

    @OneToMany(mappedBy = "project")
    private List<ProjectRequest> projectRequests;

    private String coverUrl;

    @OneToMany(mappedBy = "project")
    private Set<ProjectImage> images;

    @Enumerated(EnumType.STRING)
    private Status status;

    @Enumerated(EnumType.STRING)
    private Reason reason;

    private int leadPrice;

    private int freePositions = MAX_CONNECTIONS;

    private boolean isLead;

    @JsonIgnore
    @OneToMany(mappedBy = "project")
    private List<ProjectAction> projectActions;




    @Override
    public Project setCoverUrl(String imageCoverUrl) {
        this.coverUrl = imageCoverUrl;
        return this;
    }

    @Override
    public String getCoverUrl() {
        return this.coverUrl;
    }

    public Project decrementFreePosition() {
        if (freePositions <= 0) {
            throw new IllegalStateException("Could not decrement Lead free positions");
        }
        if (--freePositions == 0) {
            isLead = false;
        }
        return this;
    }

    public Project addSystemComment(ProjectAction projectAction) {
        if(getProjectActions() == null){
            this.projectActions = new ArrayList<>();
        }
        if (projectAction != null) {
            projectActions.add(projectAction.setProject(this));
        }
        return this;
    }


    /**
     *  Project Status
     */
    public enum Status {
        VALIDATION("VALIDATION"),   // saved, ready for validation
        ACTIVE("ACTIVE"),           // validated by system or manager
        INVALID ("INVALID"),        // invalid
        IN_PROGRESS("IN_PROGRESS"), // Active/Planing
        COMPLETED("COMPLETED"),     // contractor took customer project to his backlog
        CANCELED("CANCELED");       // paused

        private final String value;

        Status (String status) {
            value = status;
        }

        public boolean equalsValue(String status) {
            return value.equals(status);
        }

        @Override
        public String toString() {
            return this.value;
        }

        public static List<Status> getActive() {
            return Arrays.asList(VALIDATION, ACTIVE, IN_PROGRESS);
        }

        public static List<Status>  getArchived() {
            return Arrays.asList(COMPLETED, CANCELED);
        }

        public static List<Status>  forPurchase() {
            return Arrays.asList(ACTIVE, IN_PROGRESS);
        }
    }


    /**
     *  Closing Reason
     */
    public enum Reason {
        DONE ("Done by Pro"),
        TOO_EXPENSIVE ("The Project is too expensive"),
        EVALUATING ("I'm still evaluating the project"),
        HIRE_OTHER ("I hired someone else"),
        DO_MYSELF ("I'm doing the work myself"),
        ESTIMATED ("I only wanted estimates"),
        OTHER ("Other, please specify"),

        //====== System resolution =====
        DUPLICATED("Project is duplicated"),
        INVALID_LOCATION("Invalid project location"),
        INVALID_SERVICE("Wrong service selected"),
        INVALID_USER("Wrong user");

        private final String reasonPhrase;

        Reason (String reasonPhrase) {
            this.reasonPhrase = reasonPhrase;
        }

        public String getPhrase() {
            return this.reasonPhrase;
        }

        @Override
        public String toString() {
            return this.reasonPhrase;
        }
    }

    public static final Map<Reason, String> cancelList = new LinkedHashMap(){{
        put(TOO_EXPENSIVE, TOO_EXPENSIVE.getPhrase());
        put(EVALUATING, EVALUATING.getPhrase());
        put(HIRE_OTHER, HIRE_OTHER.getPhrase());
        put(DO_MYSELF, DO_MYSELF.getPhrase());
        put(ESTIMATED, ESTIMATED.getPhrase());
        put(OTHER, OTHER.getPhrase());
    }};

    public static final Map<Project.Reason, String> completeList =  new LinkedHashMap(){{
        put(DONE, DONE.getPhrase());
        put(DO_MYSELF, DO_MYSELF.getPhrase());
        put(HIRE_OTHER, HIRE_OTHER.getPhrase());
    }};

    public static final Map<Project.Reason, String> invalidateList =  new LinkedHashMap(){{
        put(DUPLICATED, DUPLICATED.getPhrase());
        put(INVALID_SERVICE, INVALID_LOCATION.getPhrase());
        put(INVALID_LOCATION, INVALID_LOCATION.getPhrase());
        put(INVALID_USER, INVALID_USER.getPhrase());
    }};




}
