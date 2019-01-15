package com.improver.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

import javax.persistence.Entity;
import javax.persistence.ForeignKey;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;

@Entity(name = "company_images")
@Data
@Accessors(chain = true)
@NoArgsConstructor
public class CompanyImage extends Image {

    @ManyToOne
    @JoinColumn(name = "gallery_project_id", foreignKey = @ForeignKey(name = "images_gallery_project_fkey"))
    private GalleryProject galleryProject;


    public CompanyImage(Image image, GalleryProject galleryProject) {
        this(galleryProject, image.getName(), image.getExtension(), image.getData());
    }

    public CompanyImage(GalleryProject galleryProject, String name, String extension, byte[] data) {
        super(name, extension, data);
        this.galleryProject = galleryProject;

    }
}
