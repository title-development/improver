package com.improver.application.properties;

import static com.improver.application.properties.Path.*;

public final class UiPath {

    public static final String LOGO_URL = "/assets/img/logo-cropped.png";
    public static final String UI_CUSTOMER_BASE_PATH = "/my";
    public static final String BILLING_URL = "/pro/settings/billing";
    public static final String TERMS_OF_USE_URL = "/terms-of-use";
    public static final String BECOME_PRO_URL = "/become-pro";
    public static final String MY_STAFF_TICKETS = "/admin/tickets/my";
    public static final String DASHBOARD = "/dashboard";
    public static final String CUSTOMER_PROJECTS = UI_CUSTOMER_BASE_PATH + PROJECTS + SLASH;
    public static final String PRO_PROJECTS = PRO + PROJECTS + SLASH;
    public static final String SYSTEM_NOTIFICATION_ICON = "/assets/img/home-improve-notification-icon.png";

    private UiPath() {
    }

}
