package com.improver.service;

import com.improver.entity.Document;
import com.improver.exception.BadRequestException;
import com.improver.exception.InternalServerException;
import com.improver.repository.DocumentRepository;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
public class DocumentService {

    @Autowired DocumentRepository documentRepository;
    private final List<String> allowedExtentions = new ArrayList<>(){{
        add("jpg");
        add("jpeg");
        add("png");
        add("bmp");
        add("doc");
        add("docx");
        add("xls");
        add("xlsx");
        add("rar");
        add("zip");
        add("txt");
        add("pdf");
    }};

    public Document saveFile(MultipartFile multipartFile) {
        if (multipartFile == null) {
            throw new BadRequestException("Bad request");
        }
        if (!validateFileType(multipartFile)) {
            throw new BadRequestException("Not allowed file type");
        }
        try {
            Document file = buildFile(multipartFile.getOriginalFilename(), multipartFile.getBytes());
            documentRepository.save(file);
            return file;
        } catch (Exception e) {
            log.error("Could not save file:", e);
            throw new InternalServerException("Internal server error");
        }

    }

    public Optional<Document> getFileById(long id) {
        return documentRepository.findById(id);
    }

    private Document buildFile(String filename, byte[] data) {
        String ext = filename.substring(filename.lastIndexOf('.'));
        String name = UUID.randomUUID().toString().toLowerCase() + ext.toLowerCase();
        return new Document(name, filename, ext, data);
    }

    private boolean validateFileType(MultipartFile file) {
        String ext = file.getOriginalFilename().substring(file.getOriginalFilename().lastIndexOf('.') + 1).toLowerCase();
        return allowedExtentions.contains(ext);

    }
}
