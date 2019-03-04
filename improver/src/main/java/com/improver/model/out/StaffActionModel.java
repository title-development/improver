package com.improver.model.out;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.improver.entity.StaffAction;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;
import java.time.ZonedDateTime;

import static com.improver.util.serializer.SerializationUtil.DATE_TIME_PATTERN;

@Data
@NoArgsConstructor
@Accessors(chain = true)
public class StaffActionModel {

    private long id;
    private String author;
    private String description;
    private StaffAction.Action action;

    @JsonFormat(pattern = DATE_TIME_PATTERN)
    private ZonedDateTime created;

    public StaffActionModel(long id, String author, String description, StaffAction.Action action, ZonedDateTime created) {
        this.id = id;
        this.author = author;
        this.description = description;
        this.action = action;
        this.created = created;
    }

}
