package com.improver.controller;

import com.improver.entity.Document;
import com.improver.exception.NotFoundException;
import com.improver.repository.DocumentRepository;
import com.improver.service.DocumentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import static com.improver.application.properties.Path.DOCUMENTS_PATH;

@RestController
@RequestMapping(DOCUMENTS_PATH)
public class DocumentController {

    @Autowired DocumentService fileService;
    @Autowired DocumentRepository documentRepository;

    @GetMapping("/{name:.+}")
    public ResponseEntity<Resource> getDocument(@PathVariable String name) {
        Document document = documentRepository.findByName(name);
        if(document == null) {
            throw new NotFoundException("File not found");
        }
        HttpHeaders headers = new HttpHeaders(); headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename="+document.getOriginalName());

        ByteArrayResource  resource =  new ByteArrayResource(document.getData());

        return ResponseEntity.ok()
                .headers(headers)
                .contentLength(resource.contentLength())
                .contentType(MediaType.parseMediaType("application/octet-stream"))
                .body(resource);
    }
}
