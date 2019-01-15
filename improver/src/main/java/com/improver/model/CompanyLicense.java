package com.improver.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.improver.entity.Company;
import com.improver.entity.Review;
import com.improver.enums.State;
import com.improver.model.CompanyInfo;
import com.improver.util.serializer.SerializationUtil;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.ZonedDateTime;

import static com.improver.util.serializer.SerializationUtil.DATE_PATTERN;
import static com.improver.util.serializer.SerializationUtil.DATE_TIME_PATTERN;

@Getter
@NoArgsConstructor
public class CompanyLicense {
    private long id;
    private String number;
    @JsonFormat(pattern = SerializationUtil.DATE_PATTERN)
    private LocalDate expired;
    private String accreditation;
    private State state;

    public CompanyLicense(long id, String number, String accreditation, State state, LocalDate expired) {
        this.id = id;
        this.number = number;
        this.state = state;
        this.accreditation = accreditation;
        this.expired = expired;
    }
}
