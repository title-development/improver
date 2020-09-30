package com.improver.test;

import com.improver.entity.Image;
import com.improver.exception.ValidationException;
import com.improver.repository.ImageRepository;
import org.apache.commons.io.IOUtils;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static com.improver.application.properties.Path.IMAGES_PATH;


@Component
public class TestFileUtil {
    @Autowired private ImageRepository imageRepository;


    public byte[] loadFile(String path) {
        URL url = getClass().getClassLoader().getResource(path);
        if (url == null) {
            throw new ValidationException("URL is corrupted for " + path);
        }

        try {
            return IOUtils.toByteArray(getClass().getClassLoader().getResourceAsStream(path));
        } catch (IOException e) {
            throw new ValidationException("Could not read " + path);
        }
    }

    public String saveImage(String path) {
        String ext = path.substring(path.lastIndexOf('.'));
        String name = UUID.randomUUID().toString().toLowerCase() + ext;
        byte[] bytes = loadFile(path);
        imageRepository.save(new Image().setName(name)
            .setData(bytes)
            .setExtension(ext)
        );
        return IMAGES_PATH + '/' + name;
    }
}
