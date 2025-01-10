package com.improver.entity;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

import jakarta.persistence.*;

@Entity(name = "user_address")
@Data
@Accessors(chain = true)
@NoArgsConstructor
public class UserAddress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private String name;

    private Boolean isDefault = false;

    @Embedded
    private Location location;

    @ManyToOne
    @JoinColumn(name = "customer_id", foreignKey = @ForeignKey(name = "addresses_customer_fkey"))
    private Customer customer;


    public UserAddress(Customer customer, Location location) {
        this.customer = customer;
        this.location = location;
        this.name = location.asText();
    }

    public boolean equalsIgnoreCase(Location o) {
        if (this.getLocation() == o) return true;
        if (o == null) return false;
        return this.location.getState().equalsIgnoreCase(o.getState()) &&
            this.location.getCity().equalsIgnoreCase(o.getCity()) &&
            this.location.getStreetAddress().equalsIgnoreCase(o.getStreetAddress()) &&
            this.location.getZip().equals(o.getZip());
    }
}
