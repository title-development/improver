package com.improver.entity;

import com.improver.model.admin.AdminTrade;
import lombok.*;

import javax.persistence.*;
import java.util.List;
import java.util.stream.Collectors;

import static com.improver.util.database.DataRestrictions.CD_INTEGER;

@Data
@Entity(name = "trades")
@NoArgsConstructor
public class Trade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(unique = true)
    private String name;

    private String description;

    @Column(columnDefinition = CD_INTEGER)
    private int rating = 0;

    @Column(columnDefinition = "boolean default false")
    private boolean isAdvertised = false;

    private String imageUrl;

    @ManyToMany
    @JoinTable(name = "trades_service_types",
            joinColumns = @JoinColumn(name = "trade_id", referencedColumnName = "id"),
            inverseJoinColumns = @JoinColumn(name = "service_type_id", referencedColumnName = "id"))
    private List<ServiceType> serviceTypes;


    @ManyToMany(mappedBy = "trades", fetch = FetchType.LAZY)
    private List<Company> companies;

    public Trade(AdminTrade adminTrade, String imageUrl, List<ServiceType> serviceTypes) {
        this.name = adminTrade.getName();
        this.description = adminTrade.getDescription();
        this.rating = adminTrade.getRating();
        this.imageUrl = imageUrl;
        this.isAdvertised = adminTrade.getIsAdvertised();
        this.serviceTypes = serviceTypes;
    }

    public void removeServiceTypeById(long id) {
        getServiceTypes().removeIf(serviceType -> serviceType.getId() == id);
        serviceTypes = serviceTypes.stream().filter(serviceType -> serviceType.getId() != id).collect(Collectors.toList());
    }
}
