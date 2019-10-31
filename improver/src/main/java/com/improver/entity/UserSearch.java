package com.improver.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import lombok.experimental.Accessors;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import java.time.ZonedDateTime;
import java.util.Objects;

import static com.improver.util.serializer.SerializationUtil.DATE_TIME_PATTERN;

@Data
@Entity(name = "user_searches")
@Accessors(chain = true)
public class UserSearch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String userId;

    private String zip;

    private String search;

    private boolean isManual;

    @JsonFormat(pattern = DATE_TIME_PATTERN)
    protected ZonedDateTime created;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UserSearch that = (UserSearch) o;
        return search.equalsIgnoreCase(that.search);
    }

    @Override
    public int hashCode() {
        return Objects.hash(search.toLowerCase());
    }
}
