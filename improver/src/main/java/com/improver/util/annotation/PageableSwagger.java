package com.improver.util.annotation;

import io.swagger.annotations.ApiImplicitParam;
import io.swagger.annotations.ApiImplicitParams;

import java.lang.annotation.*;

@Target({ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
@Inherited
@ApiImplicitParams({
    @ApiImplicitParam(name = "page", dataType = "string", paramType = "query",
        value = "Results page you want to retrieve (0..N)"),
    @ApiImplicitParam(name = "size", dataType = "string", paramType = "query",
        value = "Number of records per page."),
    @ApiImplicitParam(name = "sort", allowMultiple = true, dataType = "string", paramType = "query",
        value = "Sorting criteria in the format: property(,asc|desc). " +
            "Default sort order is ascending. " +
            "Multiple sort criteria are supported.")
})
public @interface PageableSwagger {
}
