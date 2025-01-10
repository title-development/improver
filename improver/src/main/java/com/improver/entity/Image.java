package com.improver.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import java.time.ZonedDateTime;

import static com.improver.application.properties.Path.IMAGES_PATH;
import static com.improver.application.properties.Path.SLASH;

@Entity(name = "images")
@Data
@Accessors(chain = true)
@NoArgsConstructor
public class Image {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(unique = true)
    private String name;

    private String extension;

    private Size size;

    @Column(columnDefinition = "bytea")
    private byte[] data;

    private ZonedDateTime created = ZonedDateTime.now();


    public static String toImageUrl(String imageName) {
        return IMAGES_PATH + SLASH + imageName;
    }


    public Image(String name, String extension, byte[] data) {
        this.name = name;
        this.extension = extension;
            this.data = data;
    }


    public enum Size {
        SMALL("SMALL"),
        MEDIUM("MEDIUM"),
        LARGE("LARGE");

        private final String value;

        Size(String role) {
            value = role;
        }

        public boolean equalsValue(String role) {
            return value.equals(role);
        }

        @Override
        public String toString() {
            return this.value;
        }
    }
}
