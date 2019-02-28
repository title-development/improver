package com.improver.controller;

import com.improver.entity.Image;
import com.improver.entity.ProjectImage;
import com.improver.exception.NotFoundException;
import com.improver.repository.CompanyRepository;
import com.improver.repository.ImageRepository;
import com.improver.repository.ProjectImageRepository;
import com.improver.repository.UserRepository;
import com.improver.service.ImageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.concurrent.TimeUnit;

import static com.improver.application.properties.Path.*;
import static com.improver.application.properties.Path.ICON;


@RestController
public class ImageController {
    @Autowired private ImageRepository imageRepository;
    @Autowired private ImageService imageService;
    @Autowired private ProjectImageRepository projectImageRepository;
    @Autowired private CompanyRepository companyRepository;
    @Autowired private UserRepository userRepository;


    //TODO: move IMAGES_PATH to controller RequestMapping
    @GetMapping(IMAGES_PATH + "/{name:.+}")
    public ResponseEntity<Resource> getImage(@PathVariable String name) {
        HttpHeaders headers = new HttpHeaders();
        Image image = imageRepository.findByName(name);
        if (image == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        byte[] media = image.getData();
        headers.setCacheControl(CacheControl.maxAge(30, TimeUnit.DAYS).getHeaderValue());
        return new ResponseEntity<>(new ByteArrayResource(media), headers, HttpStatus.OK);
    }

    //TODO: move IMAGES_PATH to controller RequestMapping
    @GetMapping(IMAGES_PATH + "/projects/{name:.+}")
    public ResponseEntity<Resource> getProjectImage(@PathVariable String name) {
        HttpHeaders headers = new HttpHeaders();
        ProjectImage image = projectImageRepository.findByName(name)
            .orElseThrow(NotFoundException::new);
        byte[] media = image.getData();
        headers.setCacheControl(CacheControl.maxAge(30, TimeUnit.DAYS).getHeaderValue());
        return new ResponseEntity<>(new ByteArrayResource(media), headers, HttpStatus.OK);
    }

    //This is called for Notification to display icons
    @GetMapping(COMPANIES_PATH + COMPANY_ID + ICON)
    public ResponseEntity<Resource> getCompanyIcon(@PathVariable String companyId) {
        String iconUrl = companyRepository.getIconUrl(companyId)
            .orElseThrow(NotFoundException::new);
        return getImageByURL(iconUrl);
    }

    //This is called for Notification to display icons
    @GetMapping(USERS_PATH + ID_PATH_VARIABLE + ICON)
    public ResponseEntity<Resource> getUserIcon(@PathVariable("id") long id) {
        String iconUrl = userRepository.getIconUrl(id)
            .orElseThrow(NotFoundException::new);
        return getImageByURL(iconUrl);
    }

    private ResponseEntity<Resource> getImageByURL(String imageUrl) {
        String imageName = imageService.getImageNameFromURL(imageUrl);
        return getImage(imageName);
    }
}
