package com.improver.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Data
@Entity(name = "user_tutorials")
@NoArgsConstructor
@Accessors(chain = true)
@AllArgsConstructor
public class UserTutorial {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "user_id", foreignKey = @ForeignKey(name = "user_tutorial_user_fkey"))
    private User user;

    @NotNull
    @Enumerated(EnumType.STRING)
    private Tutorial tutorial;

    public UserTutorial(User user, Tutorial tutorial) {
        this.user = user;
        this.tutorial = tutorial;
    }

    public enum Tutorial {
        // Customer tutorials

        // Contractor tutorials
        COVERAGE("COVERAGE"),
        BILLING("BILLING");

        private final String value;

        Tutorial(String tutorial) {
            value = tutorial;
        }

        public boolean equalsValue(String tutorial) {
            return value.equals(tutorial);
        }

        @Override
        public String toString() {
            return this.value;
        }

        public static List<UserTutorial.Tutorial> getContractorTutorials() {
            return Arrays.asList(COVERAGE, BILLING);
        }
        public static List<UserTutorial.Tutorial> getCustomerTutorials() {
            return new ArrayList<>();
        }
    }

}
