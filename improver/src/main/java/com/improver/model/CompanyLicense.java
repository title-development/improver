package com.improver.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.improver.enums.State;
import com.improver.util.serializer.SerializationUtil;
import lombok.Getter;
import lombok.NoArgsConstructor;
import javax.validation.constraints.NotNull;
import java.time.LocalDate;


@Getter
@NoArgsConstructor
public class CompanyLicense {
    private long id;
    @NotNull
    private String accreditation;
    @NotNull
    private String number;
    @JsonFormat(pattern = SerializationUtil.DATE_PATTERN)
    private LocalDate expired;
    @NotNull
    private State state;

    public CompanyLicense(long id, String number, String accreditation, State state, LocalDate expired) {
        this.id = id;
        this.number = number;
        this.state = state;
        this.accreditation = accreditation;
        this.expired = expired;
    }
}
