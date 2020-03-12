package com.improver.model.in;

import com.improver.entity.Location;
import lombok.Data;
import lombok.experimental.Accessors;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

import static com.improver.util.ErrorMessages.ORDER_DESCRIPTION_SIZE_ERROR_MESSAGE;
import static com.improver.util.StringUtil.capitalize;
import static com.improver.util.database.DataRestrictions.ORDER_DESCRIPTION_SIZE;

@Data
@Accessors(chain = true)
public class OrderDetails {

    @NotNull(message = "Project start expectation should be defined")
    private String startExpectation;

    @Size(max = ORDER_DESCRIPTION_SIZE, message = ORDER_DESCRIPTION_SIZE_ERROR_MESSAGE)
    private String notes;

    private String firstName;

    private String lastName;

    private String email;

    @NotNull
    private String phone;

    @NotNull
    private String streetAddress;

    @NotNull
    private String city;

    @NotNull
    private String state;

    @NotNull
    private String zip;

    public OrderDetails setEmail(String email) {
        this.email = email.toLowerCase();
        return this;
    }

    public Location getLocation() {
        return new Location(capitalize(streetAddress), capitalize(city), state, zip);
    }

    public enum StartExpectation {
        FLEXIBLE ("I'm flexible"),
        IN_48_HOURS ("Within 48 hours"),
        IN_WEEK ("Within a week"),
        IN_MONTH ("Within a moth"),
        IN_YEAR ("Within a year");

        private final String value;

        StartExpectation(String startExpectation) {
            value = startExpectation;
        }

        @Override
        public String toString() {
            return this.value;
        }
    }
}
