package com.improver.service;

import com.improver.entity.*;
import com.improver.exception.ConflictException;
import com.improver.exception.NotFoundException;
import com.improver.model.in.ProRequestReview;
import com.improver.repository.*;
import com.improver.util.mail.MailService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;


@Slf4j
@Service
public class ReviewRequestService {

    @Autowired private MailService mailService;
    @Autowired private ReviewRequestRepository requestReviewRepository;
    @Autowired private ProjectRequestRepository projectRequestRepository;

    @Value("${site.url}") private String siteUrl;

    private Pattern pattern;
    private Matcher matcher;
    private static final String EMAIL_PATTERN =
        "^[_A-Za-z0-9-\\+]+(\\.[_A-Za-z0-9-]+)*@"
            + "[A-Za-z0-9-]+(\\.[A-Za-z0-9]+)*(\\.[A-Za-z]{2,})$";

    ReviewRequestService() {
        pattern = Pattern.compile(EMAIL_PATTERN);
    }

    public void sendProjectReviewRequest(Contractor pro, Long projectRequestId){
        ProjectRequest projectRequest = projectRequestRepository.findById(projectRequestId)
            .orElseThrow(NotFoundException::new);
        if (projectRequest.getReview() == null && !projectRequest.isReviewRequested()) {
            Company company = pro.getCompany();
            Project project = projectRequest.getProject();
            projectRequestRepository.save(projectRequest.setReviewRequested(true));
            mailService.sendNewRequestReview(company, projectRequest, project.getCustomer().getEmail());
        } else {
            throw new ConflictException("This project has already been reviewed");
        }
    }


    public void sendCompanyReviewRequest(Contractor pro, ProRequestReview requestReview) {
        Company company = pro.getCompany();
        List<String> emailRecipients = requestReview.getEmails().stream()
            .distinct()
            .map(String::toLowerCase)
            .filter(this::validateEmail)
            .collect(Collectors.toList());

        if (!emailRecipients.isEmpty()) {
            for (String email : emailRecipients) {
                sendRequestReview(pro, requestReview, company, email);
            }
        }
    }

    private void sendRequestReview(Contractor pro, ProRequestReview requestReview, Company company, String email) {
        if (!requestReviewRepository.existsReviewRequestByCustomerEmailAndCompanyId(email, company.getId())) {
            List<ReviewRequest> reviewRequests = requestReviewRepository.getAllByCompanyId(pro.getCompany().getId());
            if (reviewRequests.size() < 5) {
                ReviewRequest request = new ReviewRequest(email, company.getId());
                requestReviewRepository.save(request);
                mailService.sendRequestReviewForNewUser(pro, requestReview.getSubject(), requestReview.getMessage(), email, request.getReviewToken());
            }
        }
    }

    private boolean validateEmail(final String hex) {
        matcher = pattern.matcher(hex);
        return matcher.matches();
    }
}
