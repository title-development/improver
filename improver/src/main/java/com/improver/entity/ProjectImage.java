package com.improver.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

import javax.persistence.Entity;
import javax.persistence.ForeignKey;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;

import static com.improver.application.properties.Path.*;

@Entity(name = "project_images")
@Data
@Accessors(chain = true)
@NoArgsConstructor
public class ProjectImage extends Image {

    @ManyToOne
    @JoinColumn(name = "project_id", foreignKey = @ForeignKey(name = "images_project_fkey"))
    private Project project;

    private boolean isTitle = false;



    public ProjectImage(Image image, Project project) {
        this(project, image.getName(), image.getExtension(), image.getData());
    }

    public ProjectImage(Project project, String name, String extension, byte[] data) {
        this(project, name, extension, data, false);
    }

    public ProjectImage(Project project, String name, String extension, byte[] data,  boolean isTitle) {
        super(name, extension, data);
        this.project = project;
        this.isTitle = isTitle;
    }

    public static String toProjectImageUrl(Long projectId, String imageName) {
        return PROJECTS_PATH +SLASH + projectId +  IMAGES + SLASH + imageName;
    }
}
