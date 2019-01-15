package com.improver.security.annotation;

import org.springframework.security.access.prepost.PreAuthorize;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

@Retention(RetentionPolicy.RUNTIME)
@PreAuthorize("hasAnyRole('SUPPORT', 'ADMIN', 'STAKEHOLDER')")
public @interface StaffAccess {
}

