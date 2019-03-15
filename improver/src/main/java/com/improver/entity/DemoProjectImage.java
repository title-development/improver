package com.improver.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

import javax.persistence.Entity;
import javax.persistence.ForeignKey;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;

@Entity(name = "demo_project_images")
@Data
@Accessors(chain = true)
@NoArgsConstructor
public class DemoProjectImage extends Image {

    @ManyToOne
    @JoinColumn(name = "demo_project_id", foreignKey = @ForeignKey(name = "images_demo_project_fkey"))
    private DemoProject demoProject;


    public DemoProjectImage(Image image, DemoProject demoProject) {
        this(demoProject, image.getName(), image.getExtension(), image.getData());
    }

    public DemoProjectImage(DemoProject demoProject, String name, String extension, byte[] data) {
        super(name, extension, data);
        this.demoProject = demoProject;

    }
}
