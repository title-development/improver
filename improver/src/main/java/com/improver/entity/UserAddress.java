package com.improver.entity;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

import javax.persistence.*;

@EqualsAndHashCode(callSuper = true)
@Entity(name = "user_address")
@Data
@Accessors(chain = true)
@NoArgsConstructor
public class UserAddress extends Location {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private String name;

    private boolean isDefault;

    private boolean isManual;

    @ManyToOne
    @JoinColumn(name = "customer_id", foreignKey = @ForeignKey(name = "addresses_customer_fkey"))
    private Customer customer;


    public UserAddress(Customer customer, Location location) {
        this.customer = customer;
        setStreetAddress(location.getStreetAddress())
            .setCity(location.getCity())
            .setState(location.getState())
            .setZip(location.getZip());
        this.isDefault = true;

    }
}
