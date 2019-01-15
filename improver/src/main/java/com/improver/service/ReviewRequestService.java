package com.improver.service;

import com.improver.entity.*;
import com.improver.exception.ConflictException;
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

import static com.improver.application.properties.Path.PROJECTS;
import static com.improver.application.properties.Path.SLASH;

@Slf4j
@Service
public class ReviewRequestService {

    @Autowired private MailService mailService;
    @Autowired private CustomerRepository customerRepository;
    @Autowired private CompanyRepository companyRepository;
    @Autowired private ReviewRequestRepository requestReviewRepository;
    @Autowired private CompanyConfigRepository companyConfigRepository;
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

    public void notifyUsers(Contractor pro, ProRequestReview requestReview) {

        Company company = pro.getCompany();
        CompanyConfig companyConfig = company.getCompanyConfig();
        List<String> emailRecipients = requestReview.getEmails().stream()
            .filter(this::validateEmail)
            .collect(Collectors.toList());
        List<Customer> customers = customerRepository.findAllByEmailIn(emailRecipients);
        List<String> existedEmails = customers.stream()
            .map(User::getEmail)
            .collect(Collectors.toList());
        List<String> notExistedEmails = emailRecipients.stream()
            .filter(email -> !existedEmails.contains(email))
            .collect(Collectors.toList());

        //Notify not existed users
        if (!notExistedEmails.isEmpty()) {
            for (String email : notExistedEmails) {

                List<ReviewRequest> requests = requestReviewRepository.getNotCompletedReviewRequests(email, company.getId());
                if (!requests.isEmpty()) {
                    mailService.sendRequestReviewForNewUser(pro, requestReview.getSubject(), requestReview.getMessage(), email, requests.get(0).getReviewToken());
                } else if (companyConfig.getAvailableReviewRequest() >= 0) {
                    ReviewRequest request = new ReviewRequest(email, company.getId());
                    requestReviewRepository.save(request);
                    mailService.sendRequestReviewForNewUser(pro, requestReview.getSubject(), requestReview.getMessage(), email, request.getReviewToken());
                    companyConfig.setAvailableReviewRequest(companyConfig.getAvailableReviewRequest() - 1);

                }

            }
        }

        //Notify existed users
        for (Customer customer : customers) {

            // User without project requests
            // User don't have any project with company
            if (!requestReviewRepository.existsProjectRequestByCustomerAndCompany(customer.getId(), company.getId()) &&
                // User didn't write any review for company
                !requestReviewRepository.existsReviewsByUserAndCompany(customer.getId(), company.getId())) {

                // User has uncompleted request review
                if (requestReviewRepository.existsReviewRequestByCustomerEmailAndCompanyId(customer.getEmail(), company.getId())) {

                    List<ReviewRequest> requests = requestReviewRepository.getNotCompletedReviewRequests(customer.getEmail(), company.getId());
                    if (!requests.isEmpty()) {
                        mailService.sendRequestReviewForNewUser(pro, requestReview.getSubject(), requestReview.getMessage(), customer.getEmail(), requests.get(0).getReviewToken());
                    }

                } else {
                    if (companyConfig.getAvailableReviewRequest() >= 0) {
                        ReviewRequest request = new ReviewRequest(customer.getEmail(), company.getId());
                        requestReviewRepository.save(request);
                        mailService.sendRequestReviewForNewUser(pro, requestReview.getSubject(), requestReview.getMessage(), customer.getEmail(), request.getReviewToken());
                        companyConfig.setAvailableReviewRequest(companyConfig.getAvailableReviewRequest() - 1);
                    }
                }
                continue;
            }

            // User has not reviewed project
            List<ProjectRequest> notReviewProjectRequests = projectRequestRepository.getNotReviewedProjectRequests(customer.getId(), company.getId());
            if(!notReviewProjectRequests.isEmpty()) {
                StringBuilder message = new StringBuilder();
                message.append(requestReview.getMessage());
                message.append("<h3>Unreviewed projects:<h3/>");
                notReviewProjectRequests.forEach(projectRequest -> {
                    String template = "<a href='%s'>%s</a><br>\r\n";
                    String projectRow = String.format(template, siteUrl + PROJECTS + SLASH + projectRequest.getProject().getId() + "#" + projectRequest.getId(), projectRequest.getProject().getServiceType().getName());
                    message.append(projectRow);
                });

                mailService.sendNewRequestReview(pro, requestReview.getSubject(), message.toString(), customer.getEmail());
            }
        }
        companyConfigRepository.save(companyConfig);
    }

    private boolean validateEmail(final String hex) {
        matcher = pattern.matcher(hex);
        return matcher.matches();
    }
}
