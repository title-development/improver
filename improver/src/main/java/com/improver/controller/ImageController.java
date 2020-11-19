package com.improver.controller;

import com.improver.entity.ProjectImage;
import com.improver.exception.NotFoundException;
import com.improver.model.projection.ImageProjection;
import com.improver.repository.CompanyRepository;
import com.improver.repository.ImageRepository;
import com.improver.repository.ProjectImageRepository;
import com.improver.repository.UserRepository;
import com.improver.service.ImageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import static com.improver.application.properties.Path.*;

@Slf4j
@RestController
public class ImageController {

    @Autowired private ImageRepository imageRepository;
    @Autowired private ImageService imageService;
    @Autowired private ProjectImageRepository projectImageRepository;
    @Autowired private CompanyRepository companyRepository;
    @Autowired private UserRepository userRepository;


    @GetMapping(IMAGES_PATH + "/{name:.+}")
    public ResponseEntity<Resource> getImage(@PathVariable String name) {

        return imageService.getImageByName(name);
    }


    @GetMapping(PROJECTS_PATH + ID_PATH_VARIABLE + IMAGES + "/{name:.+}")
    public ResponseEntity<Resource> getProjectImage(@PathVariable String name) {
        ProjectImage image = projectImageRepository.findByName(name)
            .orElseThrow(NotFoundException::new);
        byte[] media = image.getData();
        return imageService.addCacheControl(media);
    }

    //This is called for Notification to display icons
    @GetMapping(COMPANIES_PATH + COMPANY_ID + ICON)
    public ResponseEntity<Resource> getCompanyIcon(@PathVariable long companyId) {
        ImageProjection imageProjection = companyRepository.getCompanyIcon(companyId);

        return imageService.getImageData(imageProjection);
    }

    //This is invoked for Notification to display icons
    @GetMapping(USERS_PATH + ID_PATH_VARIABLE + ICON)
    public ResponseEntity<Resource> getUserIcon(@PathVariable("id") long userId) {
        ImageProjection imageProjection = userRepository.getUserIcon(userId);

        return imageService.getImageData(imageProjection);
    }

}
