package com.improver.controller;

import com.improver.entity.Image;
import com.improver.entity.ProjectImage;
import com.improver.exception.NotFoundException;
import com.improver.repository.ImageRepository;
import com.improver.repository.ProjectImageRepository;
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

import static com.improver.application.properties.Path.IMAGES_PATH;


@RestController
@RequestMapping(IMAGES_PATH)
public class ImageController {
    private final Logger log = LoggerFactory.getLogger(getClass());

    @Autowired private ImageRepository imageRepository;
    @Autowired private ProjectImageRepository projectImageRepository;



    @GetMapping("/{name:.+}")
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

    @GetMapping("/projects/{name:.+}")
    public ResponseEntity<Resource> getProjectImage(@PathVariable String name) {
        HttpHeaders headers = new HttpHeaders();
        ProjectImage image = projectImageRepository.findByName(name)
            .orElseThrow(NotFoundException::new);
        byte[] media = image.getData();
        headers.setCacheControl(CacheControl.maxAge(30, TimeUnit.DAYS).getHeaderValue());
        return new ResponseEntity<>(new ByteArrayResource(media), headers, HttpStatus.OK);
    }


    public ResponseEntity<Resource> getImageByURL(String url) {
        String imageName = url.substring(url.lastIndexOf('/') + 1);
        return getImage(imageName);
    }
}
