package com.improver.util.validator;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;
import java.time.ZonedDateTime;
public class MaxYearValidator implements ConstraintValidator<MaxYearCurrent, Integer> {
    @Override
    public void initialize(MaxYearCurrent ageValue) {
    }
    @Override
    public boolean isValid(Integer year, ConstraintValidatorContext constraintValidatorContext) {
        if ( year == null ) {
            return false;
        }
        return year <= ZonedDateTime.now().plusDays(1).getYear();
    }

}
