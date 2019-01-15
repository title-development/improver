package com.improver.controller;

import com.improver.entity.Company;
import com.improver.entity.GalleryProject;
import com.improver.exception.NotFoundException;
import com.improver.repository.CompanyRepository;
import com.improver.repository.GalleryProjectRepository;
import com.improver.service.GalleryProjectService;
import com.improver.service.ImageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.ZonedDateTime;
import java.util.Collection;
import java.util.List;

import static com.improver.application.properties.Path.*;

@RestController
@RequestMapping(COMPANIES_PATH + COMPANY_ID + "/demoprojects")
public class GalleryProjectController {

    private final Logger log = LoggerFactory.getLogger(getClass());

    @Autowired private GalleryProjectService galleryProjectService;
    @Autowired private GalleryProjectRepository galleryProjectRepository;
    @Autowired private ImageService imageService;
    @Autowired private CompanyRepository companyRepository;



    @GetMapping
    public ResponseEntity<List<GalleryProject>> getGalleryProjects(@PathVariable String companyId) {
        List<GalleryProject> galleryProjects = galleryProjectService.getGalleryProjects(companyId);
        return new ResponseEntity<>(galleryProjects, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<Void> addGalleryProject(@PathVariable String companyId, @RequestBody GalleryProject galleryProject) {
        galleryProjectService.addGalleryProject(companyId, galleryProject);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PostMapping("/presave")
    public ResponseEntity<GalleryProject> preSaveGalleryProject(@PathVariable String companyId, @RequestBody GalleryProject galleryProject) {
        GalleryProject project = galleryProjectService.preSaveProjectTemplate(companyId, galleryProject);
        return new ResponseEntity<>(project, HttpStatus.OK);
    }

    @GetMapping(ID_PATH_VARIABLE)
    public ResponseEntity<GalleryProject> getGalleryProject(@PathVariable String companyId, @PathVariable long id) {
        GalleryProject galleryProject = galleryProjectService.getGalleryProject(companyId, id);
        return new ResponseEntity<>(galleryProject, HttpStatus.OK);
    }


    @PutMapping(ID_PATH_VARIABLE)
    public ResponseEntity<Void> updateGalleryProject(@PathVariable String companyId, @PathVariable long id,
                                                     @RequestBody GalleryProject galleryProject) {
        galleryProjectService.updateGalleryProject(companyId, galleryProject.setId(id));
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @DeleteMapping(ID_PATH_VARIABLE)
    public ResponseEntity<Void> deleteGalleryProject(@PathVariable String companyId, @PathVariable long id) {
        galleryProjectService.deleteGalleryProject(companyId, id);
        return new ResponseEntity<>(HttpStatus.OK);
    }


    @GetMapping(ID_PATH_VARIABLE + IMAGES)
    public ResponseEntity<Collection<String>> getProjectPicturesUrls(@PathVariable String companyId, @PathVariable long id) {
        Company company = companyRepository.findById(companyId)
            .orElseThrow(NotFoundException::new);
        Collection<String> images = imageService.getGalleryProjectImageUrls(id);
        return new ResponseEntity<>(images, HttpStatus.OK);
    }


    @PostMapping(ID_PATH_VARIABLE + IMAGES)
    public ResponseEntity<Void> addProjectImage(@PathVariable String companyId,
                                                @PathVariable long id,
                                                MultipartFile file) {
        GalleryProject project = galleryProjectService.getGalleryProject(companyId, id);
        String imageUrl = imageService.saveProjectImage(file, project);
        // Set first picture as a cover
        if (!project.hasCover()) {
            project.setCoverUrl(imageUrl);
        }
        galleryProjectRepository.save(project.setUpdated(ZonedDateTime.now()));
        return new ResponseEntity<>(HttpStatus.OK);
    }



    @DeleteMapping(ID_PATH_VARIABLE + IMAGES)
    public ResponseEntity<String> deleteGalleryProjectImage(@PathVariable String companyId,
                                                            @PathVariable long id,
                                                            @RequestParam String imageUrl) {
        GalleryProject project = galleryProjectService.getGalleryProject(companyId, id);
        String newCoverUrl = imageService.deleteProjectImage(imageUrl,project);
        project.setCoverUrl(newCoverUrl);
        galleryProjectRepository.save(project.setUpdated(ZonedDateTime.now()));
        return new ResponseEntity<>(HttpStatus.OK);
    }
}
