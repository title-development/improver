package com.improver.entity;

import com.fasterxml.jackson.core.type.TypeReference;
import com.improver.model.admin.AdminServiceType;
import com.improver.util.serializer.SerializationUtil;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

import javax.persistence.*;
import java.util.List;
import java.util.stream.Collectors;

import static com.improver.util.database.DataAccessUtil.CD_INTEGER;
import static com.improver.util.serializer.SerializationUtil.fromJson;

@Data
@Entity(name = "service_types")
@NoArgsConstructor
@Accessors(chain = true)
public class ServiceType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(unique = true)
    private String name;

    @Column(columnDefinition = "varchar(2500)")
    private String description;

    private String imageUrl;

    @Column(columnDefinition = "boolean default true")
    private boolean active = true;

    @Column(columnDefinition = "varchar(16000)")
    private String labels;

    @ManyToMany(mappedBy = "serviceTypes")
    private List<Trade> trades;

    @OneToMany(mappedBy = "serviceType")
    private List<Project> projects;

    @ManyToMany(mappedBy = "serviceTypes")
    private List<Company> companies;

    @ManyToOne
    @JoinColumn(name = "questionary_id", foreignKey = @ForeignKey(name = "service_questionary_fkey"))
    private Questionary questionary;

    @Column(columnDefinition = CD_INTEGER)
    private int rating;

    @Column(columnDefinition = "integer default 2050")
    private int leadPrice = 2050;

    public ServiceType(AdminServiceType adminServiceType, List<Trade> trades, String imageUrl) {
        this.name = adminServiceType.getName();
        this.description = adminServiceType.getDescription();
        this.active = adminServiceType.isActive();
        this.rating = adminServiceType.getRating();
        this.leadPrice = adminServiceType.getLeadPrice();
        this.labels = SerializationUtil.toJson(adminServiceType.getLabels());
        addTrades(trades);
        this.imageUrl = imageUrl;
    }


    public void removeTradeById(long id) {
        getTrades().removeIf(trade -> trade.getId() == id);
    }

    public ServiceType setLabels(List<String> labelsList) {
        this.labels = SerializationUtil.toJson(labelsList);
        return this;
    }

    public ServiceType addTrades(List<Trade> toUpdate) {
        trades = toUpdate.stream()
            .peek(trade -> trade.getServiceTypes().add(this))
            .collect(Collectors.toList());

        return  this;
    }

    public ServiceType updateTrades(List<Trade> toUpdate) {
        //List of this.trades that not exist in toUpdate List
        List<Trade> toDelete = getTrades().stream()
            .filter(existed -> toUpdate.stream()
                .noneMatch(trade -> trade.getId() == existed.getId()))
            .peek(trade -> trade.getServiceTypes().remove(this))
            .collect(Collectors.toList());
        getTrades().removeAll(toDelete);

        //List of toUpdate that not exist in this.trades List
        List<Trade> newTrades = toUpdate.stream()
            .filter(newTrade -> getTrades().stream()
                .noneMatch(trade -> trade.getId() == newTrade.getId()))
            .peek(trade -> trade.getServiceTypes().add(this))
            .collect(Collectors.toList());

        getTrades().addAll(newTrades);
        return this;
    }

    public List<String> getLabels() {
        return fromJson(new TypeReference<List<String>>() {
        }, labels);
    }


}

