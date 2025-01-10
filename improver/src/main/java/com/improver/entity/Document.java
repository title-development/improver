package com.improver.entity;

import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.persistence.*;
import java.time.ZonedDateTime;

@Entity(name = "documents")
@NoArgsConstructor
@Data
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(unique = true)
    private String name;

    private String originalName;

    private String extension;

    private ZonedDateTime created = ZonedDateTime.now();

    @Column(columnDefinition = "bytea")
    private byte[] data;

    public Document(String name, String originalName, String extension, byte[] data)  {
        this.name = name;
        this.extension = extension;
        this.data = data;
        this.originalName = originalName;
    }
}
