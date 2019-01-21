package com.improver.util.validator;

import static java.lang.annotation.ElementType.FIELD;
import static java.lang.annotation.RetentionPolicy.RUNTIME;

import java.lang.annotation.Documented;
import java.lang.annotation.Retention;
import java.lang.annotation.Target;
import javax.validation.Constraint;
import javax.validation.Payload;

@Target({ FIELD })
@Retention(RUNTIME)
@Documented
@Constraint(validatedBy = { MaxYearValidator.class })
public @interface MaxYearCurrent {
    String message() default "Should be no more than the current year";
    Class<?>[] groups() default { };
    Class<? extends Payload>[] payload() default { };
}
