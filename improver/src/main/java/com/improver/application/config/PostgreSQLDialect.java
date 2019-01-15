package com.improver.application.config;

import com.improver.util.database.PgSearchInFieldFunction;
import org.hibernate.dialect.PostgreSQL95Dialect;

public class PostgreSQLDialect extends PostgreSQL95Dialect {

    public PostgreSQLDialect() {
        registerFunction("searchInField", new PgSearchInFieldFunction());
    }
}
