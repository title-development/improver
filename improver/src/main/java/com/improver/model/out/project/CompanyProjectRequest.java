package com.improver.model.out.project;

import com.improver.entity.Company;
import com.improver.entity.Contractor;
import com.improver.entity.ProjectRequest;
import com.improver.entity.Project;
import com.improver.model.out.UserModel;
import lombok.Getter;

import java.time.LocalDate;

import static com.improver.entity.ProjectRequest.Status.*;

@Getter
public class CompanyProjectRequest {

    private final long id;
    private final CompanyModel company;
    private final UserModel contractor;
    private final ProjectRequest.Status status;
    private final boolean isReviewed;
    private Project.Status projectStatus;
    private Long unreadMessages;




    /**
     * Short
     */
    public CompanyProjectRequest(ProjectRequest projectRequest, Company company, Project.Status projectStatus, Object reviewId, Long unreadMessages) {
        this(projectRequest, company, null, projectStatus, reviewId, unreadMessages);
    }

    public CompanyProjectRequest(ProjectRequest projectRequest, Company company, Project.Status projectStatus, Object reviewId) {
        this(projectRequest, company, null, projectStatus, reviewId, null);
    }

    public CompanyProjectRequest(ProjectRequest projectRequest, Company company, Contractor contractor, Project.Status projectStatus, Object reviewId, Long unreadMessages) {
        this.id = projectRequest.getId();
        this.company = new CompanyModel(company.getId(), company.getName(), company.getIconUrl(), company.getRating(), company.getReviewCount(), company.getFounded(), company.isApproved());
        this.contractor = contractor == null? null : new UserModel(contractor.getId(), contractor.getDisplayName(), null, contractor.getEmail(), null);
        this.status = REFUND.equals(projectRequest.getStatus()) || REFUNDED.equals(projectRequest.getStatus()) ? CLOSED : projectRequest.getStatus();
        this.isReviewed = reviewId != null;
        this.projectStatus = projectStatus;
        this.unreadMessages = unreadMessages;
    }


    @Getter
    public static class CompanyModel{
        private String id;
        private String name;
        private String iconUrl;
        private double rating;
        private int reviewCount;
        private int yearsInBusiness;
        private boolean isApproved;


        public CompanyModel(String id, String name, String iconUrl, double rating, int reviewCount, int founded, boolean isApproved) {
            this.id = id;
            this.name = name;
            this.iconUrl = iconUrl;
            this.rating = rating;
            this.reviewCount = reviewCount;
            this.yearsInBusiness = LocalDate.now().getYear() - founded;
            this.isApproved = isApproved;
        }
    }




}
