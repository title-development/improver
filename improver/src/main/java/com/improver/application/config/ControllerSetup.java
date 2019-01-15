package com.improver.application.config;

import org.springframework.beans.propertyeditors.StringTrimmerEditor;
import org.springframework.web.bind.WebDataBinder;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.InitBinder;

@ControllerAdvice
public class ControllerSetup {

    /**
     * Configure all controllers to trim String properties
     */
    @InitBinder
    public void initBinder(WebDataBinder binder ) {
        binder.registerCustomEditor(String.class, new StringTrimmerEditor(true));
    }
}
