package com.improver.controller;

import com.improver.entity.Company;
import com.improver.entity.DemoProject;
import com.improver.exception.NotFoundException;
import com.improver.repository.CompanyRepository;
import com.improver.repository.DemoProjectRepository;
import com.improver.service.DemoProjectService;
import com.improver.service.ImageService;
import groovy.util.logging.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.ZonedDateTime;
import java.util.Collection;
import java.util.List;

import static com.improver.application.properties.Path.*;

@Slf4j
@RestController
@RequestMapping(COMPANIES_PATH + COMPANY_ID + "/profile/projects")
public class DemoProjectController {

    @Autowired private DemoProjectService demoProjectService;
    @Autowired private DemoProjectRepository demoProjectRepository;
    @Autowired private ImageService imageService;
    @Autowired private CompanyRepository companyRepository;


    @GetMapping
    public ResponseEntity<List<DemoProject>> getDemoProjects(@PathVariable String companyId) {
        List<DemoProject> demoProjects = demoProjectService.getDemoProjects(companyId);
        return new ResponseEntity<>(demoProjects, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<DemoProject> addDemoProject(@PathVariable String companyId, @RequestBody DemoProject demoProject) {
        DemoProject project = demoProjectService.addDemoProject(companyId, demoProject);
        return new ResponseEntity<>(project, HttpStatus.OK);
    }


    @GetMapping(ID_PATH_VARIABLE)
    public ResponseEntity<DemoProject> getDemoProject(@PathVariable String companyId, @PathVariable long id) {
        DemoProject demoProject = demoProjectService.getDemoProject(companyId, id);
        return new ResponseEntity<>(demoProject, HttpStatus.OK);
    }


    @PutMapping(ID_PATH_VARIABLE)
    public ResponseEntity<DemoProject> updateDemoProject(@PathVariable String companyId, @PathVariable long id,
                                                  @RequestBody DemoProject demoProject) {
        DemoProject project = demoProjectService.updateDemoProject(companyId, demoProject.setId(id));
        return new ResponseEntity<>(project, HttpStatus.OK);
    }

    @DeleteMapping(ID_PATH_VARIABLE)
    public ResponseEntity<Void> deleteDemoProject(@PathVariable String companyId, @PathVariable long id) {
        demoProjectService.deleteDemoProject(companyId, id);
        return new ResponseEntity<>(HttpStatus.OK);
    }


    @GetMapping(ID_PATH_VARIABLE + IMAGES)
    public ResponseEntity<Collection<String>> getProjectPicturesUrls(@PathVariable String companyId, @PathVariable long id) {
        Company company = companyRepository.findById(companyId)
            .orElseThrow(NotFoundException::new);
        Collection<String> images = imageService.getDemoProjectImageUrls(id);
        return new ResponseEntity<>(images, HttpStatus.OK);
    }


    @PostMapping(ID_PATH_VARIABLE + IMAGES)
    public ResponseEntity<Void> addProjectImage(@PathVariable String companyId,
                                                @PathVariable long id,
                                                MultipartFile file) {
        DemoProject project = demoProjectService.getDemoProject(companyId, id);
        String imageUrl = imageService.saveProjectImage(file, project);
        // Set first picture as a cover
        if (!project.hasCover()) {
            project.setCoverUrl(imageUrl);
        }
        demoProjectRepository.save(project.setUpdated(ZonedDateTime.now()));
        return new ResponseEntity<>(HttpStatus.OK);
    }


    @DeleteMapping(ID_PATH_VARIABLE + IMAGES)
    public ResponseEntity<String> deleteDemoProjectImage(@PathVariable String companyId,
                                                         @PathVariable long id,
                                                         @RequestParam String imageUrl) {
        DemoProject project = demoProjectService.getDemoProject(companyId, id);
        String newCoverUrl = imageService.deleteProjectImage(imageUrl, project);
        project.setCoverUrl(newCoverUrl);
        demoProjectRepository.save(project.setUpdated(ZonedDateTime.now()));
        return new ResponseEntity<>(HttpStatus.OK);
    }
}
