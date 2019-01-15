package com.improver.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.improver.model.ContractorInvitation;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

import javax.persistence.*;
import java.time.ZonedDateTime;

import static com.improver.util.serializer.SerializationUtil.DATE_TIME_PATTERN;

@Data
@Entity(name = "invitations")
@Accessors(chain = true)
@AllArgsConstructor
@NoArgsConstructor
public class Invitation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
    private String email;
    private int bonus;
    @JsonFormat(pattern = DATE_TIME_PATTERN)
    private ZonedDateTime created = ZonedDateTime.now();
    @JsonFormat(pattern = DATE_TIME_PATTERN)
    private ZonedDateTime activated;
    private String description;

    public static Invitation of(ContractorInvitation contractorInvitation) {
        return new Invitation()
            .setEmail(contractorInvitation.getEmail())
            .setBonus(contractorInvitation.getBonus())
            .setDescription(contractorInvitation.getDescription());
    }

}
