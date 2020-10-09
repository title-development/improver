package com.improver.model.admin;

import com.improver.entity.ServiceType;
import com.improver.model.NameIdTuple;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

import java.util.List;

@Data
@NoArgsConstructor
@Accessors(chain = true)
public class AdminServiceType {
    private long id;
    private String name;
    private String description;
    private String imageUrl;
    private Boolean isActive;
    private List<String> labels;
    private int leadPrice;
    private long questionaryId;
    private List<NameIdTuple> trades;

    public AdminServiceType(ServiceType serviceType, Long questionaryId) {
        this.id = serviceType.getId();
        this.name = serviceType.getName();
        this.description = serviceType.getDescription();
        this.imageUrl = serviceType.getImageUrl();
        this.isActive = serviceType.isActive();
        this.labels = serviceType.getLabels();
        this.leadPrice = serviceType.getLeadPrice();
        this.questionaryId = questionaryId != null ? questionaryId : 0;
    }
}
