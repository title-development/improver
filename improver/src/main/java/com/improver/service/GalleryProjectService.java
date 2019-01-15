package com.improver.service;

import com.improver.entity.Company;
import com.improver.entity.GalleryProject;
import com.improver.exception.NotFoundException;
import com.improver.repository.CompanyImageRepository;
import com.improver.repository.CompanyRepository;
import com.improver.repository.GalleryProjectRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
public class GalleryProjectService {

    private final Logger log = LoggerFactory.getLogger(getClass());

    @Autowired private CompanyRepository companyRepository;
    @Autowired private GalleryProjectRepository galleryProjectRepository;
    @Autowired private CompanyImageRepository companyImageRepository;



    public List<GalleryProject> getGalleryProjects(String companyId) {
        return galleryProjectRepository.findByCompanyIdOrderByCreatedDesc(companyId);
    }

    public GalleryProject getGalleryProject(String companyId, long projectId) {
        GalleryProject project = galleryProjectRepository.findByCompanyIdAndId(companyId, projectId);
        if (project == null) {
            throw new NotFoundException();
        }
        return project;
    }

    public void addGalleryProject(String companyId, GalleryProject galleryProject) {
        Company company = companyRepository.findById(companyId)
            .orElseThrow(NotFoundException::new);
        galleryProjectRepository.save(galleryProject.setCompany(company));
    }

    /**
     * @param galleryProject - may be with empty (nullable) fields
     *
     */
    public GalleryProject preSaveProjectTemplate(String companyId, GalleryProject galleryProject) {
        Company company = companyRepository.findById(companyId)
            .orElseThrow(NotFoundException::new);
        return galleryProjectRepository.save(galleryProject.setCompany(company));

    }

    public void updateGalleryProject(String companyId, GalleryProject galleryProject) {
        GalleryProject old = galleryProjectRepository.findByCompanyIdAndId(companyId, galleryProject.getId());
        if (old == null) {
            throw new NotFoundException();
        }
        galleryProjectRepository.save(old.setName(galleryProject.getName())
            .setDate(galleryProject.getDate())
            .setPrice(galleryProject.getPrice())
            .setDescription(galleryProject.getDescription())
            .setLocation(galleryProject.getLocation())
            .setServices(galleryProject.getServices())
        );


    }


    public void deleteGalleryProject(String companyId, long projectId) {
        galleryProjectRepository.deleteByCompanyIdAndId(companyId, projectId);
    }
}
