package com.improver.service;


import com.improver.entity.*;
import com.improver.exception.InternalServerException;
import com.improver.exception.NotFoundException;
import com.improver.exception.ValidationException;
import com.improver.model.NameDataTuple;
import com.improver.model.projection.ImageProjection;
import com.improver.repository.DemoProjectImageRepository;
import com.improver.repository.ImageRepository;
import com.improver.repository.ProjectImageRepository;
import com.improver.util.ImageContainable;
import org.apache.commons.codec.binary.Base64;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;
import java.time.ZonedDateTime;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

import static com.improver.application.properties.Path.IMAGES_PATH;
import static com.improver.application.properties.Path.SLASH;
import static com.improver.application.properties.SystemProperties.IMAGES_CACHE_DURATION;
import static com.improver.application.properties.SystemProperties.SERVICE_CATALOG_CACHE_DURATION;


@Service
public class ImageService {

    private static final char COMMA = ',';
    private static final char FILE_EXTENSION_SEPARATOR = '.';
    private ZonedDateTime tradeImagesCacheExpirationTime;
    private List<NameDataTuple> tradeImages;

    private final Logger log = LoggerFactory.getLogger(getClass());

    @Autowired private ImageRepository imageRepository;
    @Autowired private ProjectImageRepository projectImageRepository;
    @Autowired private DemoProjectImageRepository demoProjectImageRepository;
    @Autowired private ResourceLoader resourceLoader;



    public String saveImage(MultipartFile file) throws ValidationException, InternalServerException {
        return saveProjectImage(file, null);
    }

    /**
     * Saves Image.
     * Accepts image as BASE64 encoded data like "data:image/jpeg;base64,/9j/4AAQ...yD==".
     * or
     * path to an external resource like "https://....."
     *
     * @return image url
     */
    public String saveBase64Image(String imageInBase64) throws ValidationException, InternalServerException {
        String imageUrl;
        if (imageInBase64.startsWith("https://")){
            return imageInBase64;
        }
        int startOfBase64Data = imageInBase64.indexOf(COMMA) + 1;
        imageInBase64 = imageInBase64.substring(startOfBase64Data, imageInBase64.length());

        if (!Base64.isBase64(imageInBase64)) {
            throw new ValidationException("Image is not in BASE64 format!");
        }

        try {
            byte[] data = Base64.decodeBase64(imageInBase64);
            Image image = buildImage(data,null);
            imageUrl = saveGenericImage(image);
        } catch (Exception e) {
            throw new InternalServerException("Could not upload image", e);
        }
        return imageUrl;
    }

    public boolean isBase64Image(String imageInBase64) {
        if(imageInBase64 == null) {
            return  false;
        }
        int startOfBase64Data = imageInBase64.indexOf(COMMA) + 1;
        imageInBase64 = imageInBase64.substring(startOfBase64Data, imageInBase64.length());
        return  Base64.isBase64(imageInBase64);
    }

    public String saveProjectImage(MultipartFile file, ImageContainable imageContainable) throws ValidationException, InternalServerException {
        String imageUrl;
        if (file == null || file.isEmpty()) {
            log.error("Image is empty");
            throw new ValidationException("Image is empty");
        }

        try {
            Image image = buildImage(file.getBytes(), file.getOriginalFilename());
            if (imageContainable == null) {
                return saveGenericImage(image);
            }

            if (imageContainable instanceof Project) {
                Project project = (Project) imageContainable;
                imageUrl = saveProjectImage(project, image);
            } else {
                DemoProject project = (DemoProject) imageContainable;
                imageUrl = saveDemoProjectImage(project, image);
            }
            log.debug("Image saved by {}", imageUrl);
        } catch (Exception e) {
            log.error("Could not save Project image", e);
            throw new InternalServerException("Unexpected error during project image upload");
        }
        return imageUrl;
    }


    public String deleteProjectImage(String imageUrl, ImageContainable imageContainable) {
        String imageName = getImageNameFromURL(imageUrl);
        boolean isCover = imageUrl.equals(imageContainable.getCoverUrl());
        Collection<String> imageUrls = Collections.emptyList();

        if (imageContainable instanceof Project) {
            Project project = (Project) imageContainable;
            projectImageRepository.deleteByNameAndProjectId(imageName, project.getId());
            if (isCover) {
                imageUrls = getProjectImageUrls(project.getId());
            }
        } else {
            DemoProject project = (DemoProject) imageContainable;
            demoProjectImageRepository.deleteByNameAndProjectId(imageName, project.getId());
            if (isCover) {
                imageUrls = getDemoProjectImageUrls(project.getId());
            }
        }

        if (isCover) {
            return imageUrls.stream()
                .findFirst()
                .orElse(null);
        }
        return imageContainable.getCoverUrl();
    }

    public ResponseEntity<Resource> getImageData(ImageProjection imageProjection) {
        if (imageProjection.getImage() == null && imageProjection.getRedirectUrl() == null) {
            throw new NotFoundException();
        }

        return imageProjection.getImage() == null ? redirectToResourceURL(imageProjection.getRedirectUrl())
            : addCacheControl(imageProjection.getImage());
    }

    private void resetTradeImagesCacheExpiration() {
        this.tradeImagesCacheExpirationTime = ZonedDateTime.now().plus(SERVICE_CATALOG_CACHE_DURATION);
    }

    public ResponseEntity<Resource> getImageByName(String name) {
        if (this.tradeImagesCacheExpirationTime == null || ZonedDateTime.now().isAfter(this.tradeImagesCacheExpirationTime)) {
            this.tradeImages = imageRepository.findAllTradeImages();
            resetTradeImagesCacheExpiration();
        }

        NameDataTuple nameDataTuple = this.tradeImages.stream()
            .filter(cacheImage -> cacheImage.getName().equals(name))
            .findFirst()
            .orElseGet(() -> new NameDataTuple(imageRepository.findByName(name).orElseThrow(NotFoundException::new)));

        return addCacheControl(nameDataTuple.getData());
    }

    private ResponseEntity<Resource> redirectToResourceURL(String iconUrl) {
        HttpHeaders headers = new HttpHeaders();
        headers.setLocation(URI.create(iconUrl));
        return new ResponseEntity<>(headers, HttpStatus.MOVED_PERMANENTLY);
    }

    public ResponseEntity<Resource> addCacheControl(byte[] media) {
        HttpHeaders headers = new HttpHeaders();
        headers.setCacheControl(CacheControl.maxAge(IMAGES_CACHE_DURATION.getSeconds(), TimeUnit.SECONDS));
        return new ResponseEntity<>(new ByteArrayResource(media), headers, HttpStatus.OK);
    }

    private String saveGenericImage(Image image) {
        imageRepository.save(image);
        return IMAGES_PATH + SLASH + image.getName();
    }


    private String saveProjectImage(Project project, Image image) {
        projectImageRepository.save(new ProjectImage(image, project));
        return ProjectImage.toProjectImageUrl(project.getId(), image.getName());
    }

    private String saveDemoProjectImage(DemoProject project, Image image) {
        demoProjectImageRepository.save(new DemoProjectImage(image, project));
        return Image.toImageUrl(image.getName());
    }


    private Image buildImage(byte[] data, String filename) {
        String ext = (filename == null) ? ".jpg" : filename.substring(filename.lastIndexOf(FILE_EXTENSION_SEPARATOR));
        String name = UUID.randomUUID().toString().toLowerCase() + ext;
        return new Image(name, ext, data);
    }





    public Collection<String> getProjectImageUrls(long projectId) {
        return projectImageRepository.getImageUrlsByProject(projectId).stream()
            .map(image -> ProjectImage.toProjectImageUrl(projectId, image))
            .collect(Collectors.toList());
    }

    public Collection<String> getDemoProjectImageUrls(long projectId) {
        return demoProjectImageRepository.getImagesByProject(projectId).stream()
            .map(Image::toImageUrl)
            .collect(Collectors.toList());
    }


    public void remove(String imageName) throws NotFoundException {
        long i = imageRepository.deleteByName(imageName);
        if (i >= 0) {
            log.info("Image {} successfully removed", imageName);
        } else {
            throw new NotFoundException("Image already deleted or does not exist" + imageName);
        }
    }


    public String updateBase64Image(String base64, String oldImageUrl) throws ValidationException, InternalServerException {
        if (base64 == null || base64.isEmpty()) {
            return oldImageUrl;
        }

        if (oldImageUrl != null && !oldImageUrl.isEmpty()) {
            silentDelete(oldImageUrl);
        }

        return saveBase64Image(base64);
    }

    public String updateImage(MultipartFile file, String oldImageUrl) throws ValidationException, InternalServerException {
        if (file == null) {
            return oldImageUrl;
        }

        if (oldImageUrl != null && !oldImageUrl.isEmpty()) {
            silentDelete(oldImageUrl);
        }
        return saveImage(file);
    }

    /**
     * @param imageUrl /api/images/a7466cb2-63fc-433f-8911-6ef6c72d2eae.jpg
     */
    public void silentDelete(final String imageUrl) {
        if (imageUrl == null || imageUrl.lastIndexOf('/') < 1) {
            log.warn("Invalid image link={}", imageUrl);
            return;
        }
        String imageName = getImageNameFromURL(imageUrl);
        try {
            remove(imageName);
        } catch (NotFoundException e) {
            log.error("Cannot delete image {}. Image already deleted or does not exist", imageName);
        }
    }

    public String getImageNameFromURL(String imageUrl) {
        return imageUrl.substring(imageUrl.lastIndexOf(SLASH) + 1);
    }

}
