package com.improver.application.properties;

/**
 * Path
 *
 * @author Mykhailo Soltys
 */
public final class Path {

    private Path() {
    }

    /* Sub PATHs */
    public static final String USERS =                 "/users";
    public static final String CUSTOMERS =             "/customers";
    public static final String CONTRACTORS =           "/contractors";
    public static final String PRO =                   "/pro";
    public static final String COMPANIES =             "/companies";
    public static final String CARDS =                 "/cards";
    public static final String TRADES =                "/trades";
    public static final String SERVICES =              "/services";
    public static final String PROJECTS =              "/projects";
    public static final String LEADS =                 "/leads";
    public static final String PROJECT_REQUESTS =      "/project-requests";
    public static final String LICENSES =              "/licenses";
    public static final String REVIEWS =               "/reviews";
    public static final String IMAGES =                "/images";
    public static final String DOCUMENTS =             "/documents";
    public static final String PAYMENTS =              "/payments";
    public static final String TRANSACTIONS =          "/transactions";
    public static final String LOCATIONS =             "/locations";
    public static final String SUBSCRIPTION =          "/subscription";
    public static final String NOTIFICATIONS =         "/notifications";
    public static final String GEO =                   "/geo";
    public static final String UNAVAILABILITIES =      "/unavailabilities";
    public static final String TICKETS =               "/tickets";
    public static final String SOCIAL_LOGIN =          "/socials";
    public static final String INVITATIONS =           "/invitations";
    public static final String STATISTICS =            "/statistics";
    public static final String JOBS =                  "/jobs";
    public static final String TUTORIALS =             "/tutorials";
    public static final String STAFF =                 "/staff";
    public static final String COVERAGE =              "/coverage";
    public static final String CONFIG =                "/config";
    public static final String REFERRAL =              "/referral";
    public static final String REQUEST =               "/request";
    public static final String REVISION =              "/revision";
    public static final String DECLINE =               "/decline";
    public static final String ACCEPT =                "/accept";


    public static final String LOGIN =               "/login";
    public static final String LOGOUT =              "/logout";
    public static final String QUESTIONARY =         "/questionary";
    public static final String REGISTER =            "/register";
    public static final String SEARCHES =            "/searches";
    public static final String CONFIRM =             "/confirm";
    public static final String ACTIVATION =          "/activation";
    public static final String EMAIL =               "/email";
    public static final String PASSWORD =            "/password";
    public static final String UI_RESTORE_PASSWORD = "/restore-password";
    public static final String POPULAR =             "/popular";
    public static final String RECOMMENDED =         "/recommended";
    public static final String SUGGESTED =           "/suggested";
    public static final String DEMO_PROJECTS =       "/demo-projects";
    public static final String REFUND =              "/refund";
    public static final String CATALOG =             "/catalog";
    public static final String OPTIONS =             "/options";
    public static final String ACTIONS =             "/actions";
    public static final String ICON =                "/icon";
    public static final String IS_EMAIL_FREE =       "/isEmailFree";
    public static final String IS_NAME_FREE =        "/isNameFree";


    /* Path variables*/
    public static final String ID_PATH_VARIABLE =      "/{id}";
    public static final String EMAIL_PATH_VARIABLE =   "/{email}";
    public static final String COMPANY_ID =            "/{companyId}";
    public static final String USER_ID =               "/{userId}";


    /* Base PATHs */

    public static final char   SLASH =                  '/';
    public static final String API_PATH_PREFIX =        SLASH + "api";
    public static final String IMAGES_PATH =            API_PATH_PREFIX + IMAGES;
    public static final String DOCUMENTS_PATH =         API_PATH_PREFIX + DOCUMENTS;
    public static final String USERS_PATH =             API_PATH_PREFIX + USERS;
    public static final String CATALOG_PATH =           API_PATH_PREFIX + CATALOG;
    public static final String TRADES_PATH =            API_PATH_PREFIX + TRADES;
    public static final String SERVICES_PATH =          API_PATH_PREFIX + SERVICES;
    public static final String PROJECTS_PATH =          API_PATH_PREFIX + PROJECTS;
    public static final String PROS_PATH =              API_PATH_PREFIX + PRO;
    public static final String CUSTOMERS_PATH =         API_PATH_PREFIX + CUSTOMERS ;
    public static final String LEADS_PATH =             API_PATH_PREFIX + PRO + LEADS;
    public static final String PROJECT_REQUESTS_PATH =  API_PATH_PREFIX + PROJECT_REQUESTS;
    public static final String COMPANIES_PATH =         API_PATH_PREFIX + COMPANIES;
    public static final String LOCATIONS_PATH =         API_PATH_PREFIX + LOCATIONS;
    public static final String QUESTIONARY_PATH =       API_PATH_PREFIX + QUESTIONARY;
    public static final String GEO_PATH =               API_PATH_PREFIX + GEO;
    public static final String REVIEWS_PATH =           API_PATH_PREFIX + REVIEWS;
    public static final String TICKETS_PATH =           API_PATH_PREFIX + TICKETS;
    public static final String REFUND_PATH =            API_PATH_PREFIX + REFUND;
    public static final String NOTIFICATIONS_PATH =     API_PATH_PREFIX + NOTIFICATIONS;
    public static final String SOCIAL_LOGIN_PATH =      API_PATH_PREFIX + SOCIAL_LOGIN;
    public static final String INVITATIONS_PATH =       API_PATH_PREFIX + INVITATIONS;
    public static final String STATISTICS_PATH =        API_PATH_PREFIX + STATISTICS;
    public static final String JOB_PATH  =              API_PATH_PREFIX + JOBS;
    public static final String TUTORIALS_PATH  =        API_PATH_PREFIX + TUTORIALS;
    public static final String STAFF_PATH  =            API_PATH_PREFIX + STAFF;
    public static final String REFERRAL_PATH  =         API_PATH_PREFIX + REFERRAL;

    public static final String REGISTRATION_PATH =          API_PATH_PREFIX + REGISTER;
    public static final String CONFIRM_PATH =               API_PATH_PREFIX + CONFIRM;
    public static final String LOGIN_PATH =                 API_PATH_PREFIX + LOGIN;
    public static final String LOGOUT_PATH =                API_PATH_PREFIX + LOGOUT;
    public static final String REFRESH_ACCESS_TOKEN_PATH =  API_PATH_PREFIX + "/token/access";
    public static final String PRINCIPAL_PATH =             API_PATH_PREFIX + "/principal";
    public static final String HEATH_CHECK_PATH =           SLASH + "healthcheck";
    public static final String REFRESH_COOKIE_PATH =        REFRESH_ACCESS_TOKEN_PATH;


    /*  WebSocket */
    public static final String WEB_SOCKET_ENDPOINT =        "/ws";
    public static final String WS_TOPIC =                   "/topic";
    public static final String WS_QUEUE =                   "/queue";
    public static final String WS_APP =                     "/app";
    public static final String WS_TOPIC_PROJECT_REQUESTS =  WS_TOPIC + PROJECT_REQUESTS;
    public static final String WS_APP_PROJECT_REQUESTS =    WS_APP + PROJECT_REQUESTS;
    public static final String WS_QUEUE_USERS =             WS_QUEUE + USERS;
    public static final String WS_APP_USERS =               WS_APP + USERS;
    public static final String UNREAD =                     "/unread";

    /* Resource paths */
    public static final String PATH_IMGS = "/assets/img/";
    public static final String PATH_IMGS_SERVICES = PATH_IMGS + "services/";
    public static final String PATH_IMGS_SERVICE_TILING = PATH_IMGS_SERVICES + "tiling/";
}
