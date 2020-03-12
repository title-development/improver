package com.improver.test;

import com.improver.exception.ValidationException;
import org.apache.commons.io.IOUtils;
import org.springframework.beans.BeansException;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;


@Component
public class FileUtil implements ApplicationContextAware {

    private ApplicationContext applicationContext;

    private List<String> allowedExtentions = new ArrayList<String>();

    FileUtil() {
        allowedExtentions.add("jpg");
        allowedExtentions.add("jpeg");
        allowedExtentions.add("png");
        allowedExtentions.add("bmp");
        allowedExtentions.add("doc");
        allowedExtentions.add("docx");
        allowedExtentions.add("xls");
        allowedExtentions.add("xlsx");
        allowedExtentions.add("rar");
        allowedExtentions.add("zip");
        allowedExtentions.add("txt");
        allowedExtentions.add("pdf");
    }

    @Override
    public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
        this.applicationContext = applicationContext;
    }



    public InputStream resourceAsInputStream(String path) throws IOException {
        URL url = getClass().getClassLoader().getResource(path);
        if (url == null) {
            throw new RuntimeException("URL is corrupted for " + path);
        }
        Resource resource = applicationContext.getResource(url.toString());
        InputStream in = resource.getInputStream();
        if (in == null) {
            throw new RuntimeException("Could not open InputStream for resource " + resource.getURI());
        }
        return in;
    }


    @Deprecated
    public byte[] loadFile(String path) {
        URL url = getClass().getClassLoader().getResource(path);
        if (url == null) {
            throw new ValidationException("URL is corrupted for " + path);
        }
        Resource resource = applicationContext.getResource(url.toString());
        try {
            byte[] result = IOUtils.toByteArray(resource.getInputStream());
            result = IOUtils.toByteArray(getClass().getClassLoader().getResourceAsStream(path));
            return result;
        } catch (IOException e) {
            throw new ValidationException("Could not read " + path);
        }
    }

    public List<String> getAllowedExtensions() {
        return allowedExtentions;
    }
}
