package com.improver.application.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.ViewResolver;
import org.springframework.web.servlet.config.annotation.*;
import org.springframework.web.servlet.view.InternalResourceViewResolver;

import static com.improver.application.properties.Path.CONFIRM;
import static com.improver.application.properties.Path.UI_RESTORE_PASSWORD;

@Configuration
public class MvcConfiguration implements WebMvcConfigurer {

    private static final String LAYOUT = "index";

    @Bean
    public ViewResolver getViewResolver() {
        InternalResourceViewResolver resolver = new InternalResourceViewResolver();
        resolver.setSuffix(".html");
        resolver.setPrefix("/");
        return resolver;
    }

    @Override
    public void configureDefaultServletHandling(DefaultServletHandlerConfigurer configurer) {
        configurer.enable();
    }

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        // handles home url
        registry.addViewController("/").setViewName(LAYOUT);
        // TODO dirty hack to parse dots in JWT token within URL
        registry.addViewController(CONFIRM + "/**/{token:.+}").setViewName(LAYOUT);
        registry.addViewController(UI_RESTORE_PASSWORD + "/**/{token:.+}").setViewName(LAYOUT);
        // handles generic (all other) urls
        registry.addViewController("/**/{[path:[^\\.]*}").setViewName(LAYOUT);
        // required to handle WebSocket mappings first
        registry.setOrder(2);
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        //  For SWAGGER
        registry.addResourceHandler("swagger-ui.html").addResourceLocations("classpath:/META-INF/resources/");
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**");
        registry.addMapping("/ws/**");
    }

    //
    @Override
    public void configurePathMatch(PathMatchConfigurer matcher) {
        matcher.setUseSuffixPatternMatch(true);
    }


}
