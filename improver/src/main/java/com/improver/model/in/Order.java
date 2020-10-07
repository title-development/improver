package com.improver.model.in;


import com.improver.model.UserAddressModel;
import lombok.Data;
import lombok.experimental.Accessors;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.util.List;

import static com.improver.util.ErrorMessages.ORDER_DESCRIPTION_SIZE_ERROR_MESSAGE;
import static com.improver.util.database.DataRestrictions.ORDER_DESCRIPTION_SIZE;

@Data
@Accessors(chain = true)
public class Order {

    private Long projectId;

    private long serviceId;

    private List<QuestionAnswer> questionary;

    private BaseLeadInfo baseLeadInfo;

    private UserAddressModel address;


    @Data
    @Accessors(chain = true)
    public static class BaseLeadInfo {

        @NotNull(message = "Project start expectation should be defined")
        private String startExpectation;

        @Size(max = ORDER_DESCRIPTION_SIZE, message = ORDER_DESCRIPTION_SIZE_ERROR_MESSAGE)
        private String notes;

        private String firstName;

        private String lastName;

        private String email;

        @NotNull
        private String phone;

        public BaseLeadInfo setEmail(String email) {
            this.email = email.toLowerCase();
            return this;
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


    @Data
    @Accessors(chain = true)
    public static class QuestionAnswer {

        private String name;
        private List<String> results;

        public QuestionAnswer() {
        }

        public QuestionAnswer(String name, List<String> results) {
            this.name = name;
            this.results = results;
        }
    }

}
