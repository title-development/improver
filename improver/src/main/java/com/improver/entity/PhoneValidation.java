package com.improver.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import java.time.ZonedDateTime;

import static com.improver.util.serializer.SerializationUtil.DATE_TIME_PATTERN;
import static java.time.ZonedDateTime.now;

@Data
@Accessors(chain = true)
@Entity(name = "phone_validations")
@NoArgsConstructor
public class PhoneValidation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
    private String messageSid;
    private String code;
    @JsonFormat(pattern = DATE_TIME_PATTERN)
    private ZonedDateTime created = now();

}
