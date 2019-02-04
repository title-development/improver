package com.improver.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.improver.model.in.registration.UserRegistration;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

import javax.persistence.DiscriminatorColumn;
import javax.persistence.DiscriminatorType;
import javax.persistence.Entity;
import javax.persistence.Inheritance;
import javax.persistence.InheritanceType;
import java.time.LocalDate;

@Entity(name = "staff")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@Data
@NoArgsConstructor
@Accessors(chain = true)
public abstract class Staff extends User {

    @JsonIgnore
    protected LocalDate credentialChanged;

    @JsonIgnore
    protected boolean isCredentialExpired = false;




    protected Staff(String firstName, String lastName, String email, String plainPassword, String internalPhone) {
        super(firstName, lastName, email, plainPassword, internalPhone);
        this.credentialChanged = LocalDate.now();
    }

    protected Staff(UserRegistration reg) {
        super(reg);
        this.credentialChanged = LocalDate.now();
    }
}
