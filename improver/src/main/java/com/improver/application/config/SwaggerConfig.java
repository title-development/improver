package com.improver.application.config;

import com.google.common.base.Predicate;
import com.google.common.base.Predicates;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.web.util.UriComponentsBuilder;
import springfox.documentation.builders.PathSelectors;
import springfox.documentation.service.ApiInfo;
import springfox.documentation.spi.DocumentationType;
import springfox.documentation.spring.web.paths.AbstractPathProvider;
import springfox.documentation.spring.web.paths.Paths;
import springfox.documentation.spring.web.plugins.Docket;
import springfox.documentation.swagger2.annotations.EnableSwagger2;

import static com.google.common.collect.Lists.newArrayList;
import static com.improver.application.properties.Environments.DEV;
import static springfox.documentation.builders.PathSelectors.regex;

@Configuration
@EnableSwagger2
@Profile(DEV)
public class SwaggerConfig {

    String API_VERSION = "0.1.9-SNAPSHOT";

    private ApiInfo getApiInfo(String version) {
        return new ApiInfo(
            "Home Improve private API ",
            null,
            version,
            null,
            null,
            null,
            null, newArrayList());
    }

    @Bean
    public Docket docket() {
        return new Docket(DocumentationType.SWAGGER_2)
            .groupName(API_VERSION)
            .apiInfo(getApiInfo(API_VERSION))
            .pathProvider(new BasePathAwareRelativePathProvider("/api"))
            .select()
            .paths(blockBasicErrorPath())
            .paths(apiPath())
            .build();
    }

    private Predicate<String> blockBasicErrorPath() {
        return Predicates.not(PathSelectors.regex("/error"));
    }

    private Predicate<String> apiPath() {
        return regex("/api"+".*");
    }

    class BasePathAwareRelativePathProvider extends AbstractPathProvider {
        private String basePath;

        public BasePathAwareRelativePathProvider(String basePath) {
            this.basePath = basePath;
        }

        @Override
        protected String applicationPath() {
            return basePath;
        }

        @Override
        protected String getDocumentationPath() {
            return "/";
        }

        @Override
        public String getOperationPath(String operationPath) {
            UriComponentsBuilder uriComponentsBuilder = UriComponentsBuilder.fromPath("/");
            return Paths.removeAdjacentForwardSlashes(
                uriComponentsBuilder.path(operationPath.replaceFirst(basePath, "")).build().toString());
        }
    }

}
