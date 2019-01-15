package com.improver.service;

import com.improver.entity.Document;
import com.improver.exception.BadRequestException;
import com.improver.exception.InternalServerException;
import com.improver.repository.DocumentRepository;
import com.improver.util.FileUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Optional;
import java.util.UUID;

@Service
public class DocumentService {
    private final Logger log = LoggerFactory.getLogger(getClass());

    @Autowired DocumentRepository documentRepository;
    @Autowired FileUtil fileUtil;

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
        return fileUtil.getAllowedExtensions().contains(ext);

    }
}
