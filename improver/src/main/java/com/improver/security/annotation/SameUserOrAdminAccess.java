package com.improver.security.annotation;

import org.springframework.security.access.prepost.PreAuthorize;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

@Retention(RetentionPolicy.RUNTIME)
@PreAuthorize("hasRole('ADMIN') or " +
    "@securityHelper.isSameUser(authentication, #email, #id)")
public @interface SameUserOrAdminAccess {
}
