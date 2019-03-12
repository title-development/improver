package com.improver.service;

import com.improver.entity.*;
import com.improver.exception.AccessDeniedException;
import com.improver.exception.ValidationException;
import com.improver.model.in.CloseProjectRequest;
import com.improver.repository.UserRepository;
import com.improver.util.StaffActionLogger;
import com.improver.util.mail.MailService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;
import java.util.List;

import static com.improver.model.in.CloseProjectRequest.Action.CANCEL;


@Slf4j
@Service
public class AccountService {

    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private CompanyService companyService;
    @Autowired private MailService mailService;
    @Autowired private ImageService imageService;
    @Autowired private CustomerProjectService customerProjectService;
    @Autowired private ProjectRequestService projectRequestService;
    @Autowired private StaffActionLogger staffActionLogger;
    @Autowired private UserRepository userRepository;


    public void archiveAccountWithPassword(User user, String password) {
        if (user.isNativeUser() && !passwordEncoder.matches(password, user.getPassword())) {
            throw new ValidationException("Password is not valid");
        }
        archiveAccount(user, null);

    }

    public void archiveAccount(User user, Admin admin) {
        switch (user.getRole()){

            case CUSTOMER:
                archiveCustomer((Customer) user, admin);
                break;

            case CONTRACTOR:
                archiveEntireCompany((Contractor)user, admin);
                break;

            case SUPPORT:
            case MANAGER:
            case STAKEHOLDER:
                archiveUserAccount(user, admin);
                break;

            case ADMIN:
                throw new AccessDeniedException("Admin account cannot be deleted");

            default:
                throw new IllegalArgumentException("User " + user.getRole() + " not supported archive method");
        }

    }



    private void archiveCustomer(Customer customer, Admin currentAdmin) {
        customer.getProjects().forEach(project -> {
            if (project.getStatus().equals(Project.Status.IN_PROGRESS) ||
                project.getStatus().equals(Project.Status.ACTIVE) ||
                project.getStatus().equals(Project.Status.VALIDATION)) {
                customerProjectService.closeProject(project, new CloseProjectRequest(CANCEL, Project.Reason.OTHER, "Customer deleted account"));
            }
        });
        archiveUserAccount(customer, currentAdmin);
    }

    private void archiveEntireCompany(Contractor contractor, Admin currentAdmin) {
        Company company = contractor.getCompany();
        companyService.archiveCompany(company);
        if (currentAdmin != null) {
            staffActionLogger.logCompanyDelete(currentAdmin, company);
        }
        List<Contractor> pros = company.getContractors();
        pros.forEach(pro -> archiveContractor(pro, currentAdmin));
    }


    private void archiveContractor(Contractor contractor, Admin currentAdmin) {
        contractor.getProjectRequests().forEach(projectRequest -> {
            if (ProjectRequest.Status.getActive().contains(projectRequest.getStatus()))
                projectRequestService.closeProject(projectRequest, ZonedDateTime.now(), true);
        });
        archiveUserAccount(contractor, currentAdmin);

    }


    private void archiveUserAccount(User user, Admin currentAdmin) {
        imageService.silentDelete(user.getIconUrl());
        user.setDeleted(true)
            .setIconUrl(null)
            .setUpdated(ZonedDateTime.now());
        userRepository.save(user);
        mailService.sendDeletedAccount(user);
        if (currentAdmin != null) {
            staffActionLogger.logAccountDelete(currentAdmin, user);
        }
    }
}
