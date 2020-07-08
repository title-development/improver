package com.improver.controller;

import com.improver.entity.DemoProject;
import com.improver.repository.DemoProjectRepository;
import com.improver.security.UserSecurityService;
import com.improver.service.DemoProjectService;
import com.improver.service.ImageService;
import groovy.util.logging.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.ZonedDateTime;
import java.util.Collection;

import static com.improver.application.properties.Path.*;

@Slf4j
@RestController
@RequestMapping(COMPANIES_PATH + COMPANY_ID + DEMO_PROJECTS)
public class DemoProjectController {

    @Autowired private DemoProjectService demoProjectService;
    @Autowired private DemoProjectRepository demoProjectRepository;
    @Autowired private ImageService imageService;
    @Autowired private UserSecurityService userSecurityService;


    @GetMapping
    public ResponseEntity<Page<DemoProject>> getDemoProjects(@PathVariable long companyId,
                                                             @PageableDefault(sort = "created", page = 0, size = 10, direction = Sort.Direction.DESC) Pageable pageRequest) {
        Page<DemoProject> demoProjects = demoProjectService.getDemoProjects(companyId, pageRequest);
        return new ResponseEntity<>(demoProjects, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<DemoProject> addDemoProject(@PathVariable long companyId,
                                                      @RequestBody DemoProject demoProject) {
        DemoProject project = demoProjectService.addDemoProject(companyId, demoProject);
        return new ResponseEntity<>(project, HttpStatus.OK);
    }


    @GetMapping(ID_PATH_VARIABLE)
    public ResponseEntity<DemoProject> getDemoProject(@PathVariable long companyId,
                                                      @PathVariable long id) {
        DemoProject demoProject = demoProjectService.getDemoProject(companyId, id);
        return new ResponseEntity<>(demoProject, HttpStatus.OK);
    }


    @PutMapping(ID_PATH_VARIABLE)
    public ResponseEntity<DemoProject> updateDemoProject(@PathVariable long companyId,
                                                         @PathVariable long id,
                                                         @RequestBody DemoProject demoProject) {
        DemoProject project = demoProjectService.updateDemoProject(companyId, demoProject.setId(id));
        return new ResponseEntity<>(project, HttpStatus.OK);
    }

    @DeleteMapping(ID_PATH_VARIABLE)
    public ResponseEntity<Void> deleteDemoProject(@PathVariable long companyId,
                                                  @PathVariable long id) {
        demoProjectService.deleteDemoProject(companyId, id);
        return new ResponseEntity<>(HttpStatus.OK);
    }


    @GetMapping(ID_PATH_VARIABLE + IMAGES)
    public ResponseEntity<Collection<String>> getProjectPicturesUrls(@PathVariable long companyId,
                                                                     @PathVariable long id) {
        Collection<String> images = imageService.getDemoProjectImageUrls(id);
        return new ResponseEntity<>(images, HttpStatus.OK);
    }


    @PostMapping(ID_PATH_VARIABLE + IMAGES)
    public ResponseEntity<Void> addProjectImage(@PathVariable long companyId,
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
    public ResponseEntity<String> deleteDemoProjectImage(@PathVariable long companyId,
                                                         @PathVariable long id,
                                                         @RequestParam String imageUrl) {
        DemoProject project = demoProjectService.getDemoProject(companyId, id);
        String newCoverUrl = imageService.deleteProjectImage(imageUrl, project);
        project.setCoverUrl(newCoverUrl);
        demoProjectRepository.save(project.setUpdated(ZonedDateTime.now()));
        return new ResponseEntity<>(HttpStatus.OK);
    }
}
