package com.improver.service;

import com.improver.entity.Company;
import com.improver.entity.DemoProject;
import com.improver.exception.NotFoundException;
import com.improver.repository.CompanyRepository;
import com.improver.repository.DemoProjectRepository;
import groovy.util.logging.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
public class DemoProjectService {

    @Autowired private CompanyRepository companyRepository;
    @Autowired private DemoProjectRepository demoProjectRepository;


    public List<DemoProject> getDemoProjects(long companyId) {
        return demoProjectRepository.findByCompanyIdOrderByCreatedDesc(companyId);
    }

    public DemoProject getDemoProject(long companyId, long projectId) {
        DemoProject project = demoProjectRepository.findByCompanyIdAndId(companyId, projectId);
        if (project == null) {
            throw new NotFoundException();
        }
        return project;
    }

    public DemoProject addDemoProject(long companyId, DemoProject demoProject) {
        Company company = companyRepository.findById(companyId)
            .orElseThrow(NotFoundException::new);
        return demoProjectRepository.save(demoProject.setCompany(company));
    }

    public DemoProject updateDemoProject(long companyId, DemoProject demoProject) {
        DemoProject old = demoProjectRepository.findByCompanyIdAndId(companyId, demoProject.getId());
        if (old == null) {
            throw new NotFoundException();
        }
        return demoProjectRepository.save(old.setName(demoProject.getName())
            .setDate(demoProject.getDate())
            .setPrice(demoProject.getPrice())
            .setDescription(demoProject.getDescription())
            .setLocation(demoProject.getLocation())
            .setServices(demoProject.getServices())
        );
    }


    public void deleteDemoProject(long companyId, long projectId) {
        demoProjectRepository.deleteByCompanyIdAndId(companyId, projectId);
    }
}
