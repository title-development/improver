package com.improver.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;
import lombok.experimental.Accessors;

import javax.persistence.*;

import static com.improver.util.database.DataRestrictions.CD_INTEGER;

@Data
@Accessors(chain = true)
@Entity(name = "billings")
public class Billing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @JsonIgnore
    private String stripeId;

    @JsonIgnore
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="company_id",  foreignKey = @ForeignKey(name = "billing_company_fkey"))
    private Company company;

    @Column(columnDefinition = CD_INTEGER)
    private int balance;

    @Embedded
    private Subscription subscription;


    public Billing addToBalance(int amount) {
        this.balance = this.balance + amount;
        return this;
    }


    public static Billing forNewCompany(Company company){
        return new Billing().setBalance(0)
            .setSubscription(new Subscription())
            .setCompany(company);
    }
}
