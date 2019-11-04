package com.improver.util.database;

public final class DataAccessUtil {

    private DataAccessUtil() {
    }


    public static final String CREATED_PROPERTY = "created";
    public static final String UPDATED_PROPERTY = "updated";


    public static final String UUID_GENERATOR_NAME = "system-uuid";
    public static final String UUID_NAME = "uuid";


    /* Column Definitions */
    public static final String CD_INTEGER = "integer default 0";
    public static final String CD_DOUBLE = "double precision default 0";
    public static final String CD_LONG = "bigint default 0";
    public static final String CD_BOOLEAN = "boolean default false";

    public static final int TICKET_MESSAGE_SIZE = 2500;
    public static final int COMPANY_DESCRIPTION_MIN_SIZE = 20;
    public static final int COMPANY_DESCRIPTION_MAX_SIZE = 2500;
    public static final int COMPANY_NAME_MIN_SIZE = 2;
    public static final int COMPANY_NAME_MAX_SIZE = 70;
    public static final int COMPANY_FOUNDATION_MIN_YEAR = 1900;
    public static final int COMPANY_COVERAGE_MIN_RADIUS = 5;
    public static final int COMPANY_COVERAGE_MAX_RADIUS = 50;
    public static final int ORDER_DESCRIPTION_SIZE = 1500;
    public static final int REVIEW_REQUEST_SUBJECT_MIN_SIZE = 10;
    public static final int REVIEW_REQUEST_SUBJECT_MAX_SIZE = 50;
    public static final int REVIEW_REQUEST_MESSAGE_MIN_SIZE = 10;
    public static final int REVIEW_REQUEST_MESSAGE_MAX_SIZE = 255;
    public static final int REVIEW_MESSAGE_MIN_SIZE = 10;
    public static final int REVIEW_MESSAGE_MAX_SIZE = 1500;
    public static final int USER_SEARCH_MAX_SIZE = 150;

    public static final int ADMIN_PROJECT_VALIDATION_COMMENT_MIN_SIZE = 10;
    public static final int ADMIN_PROJECT_VALIDATION_COMMENT_MAX_SIZE = 500;
    public static final int PROJECT_ACTION_COMMENT_MAX_SIZE = ADMIN_PROJECT_VALIDATION_COMMENT_MAX_SIZE + 100;
    public static final int STAFF_ACTION_DESCRIPTION_MAX_SIZE = 500;


}
