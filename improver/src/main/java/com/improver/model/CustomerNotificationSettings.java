package com.improver.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

@Data
@Accessors(chain = true)
@NoArgsConstructor
public class CustomerNotificationSettings {

    //Order Lifecycle
    //Email notification on order request, close, cancel, etc
    private boolean isProjectLifecycle;

    //Pro requests
    //Receive emails when PRO sent you project request
    private boolean isProRequests;

    //Marketing
    //Receive emails regarding updates and special offers from Home Improve
    private boolean isMarketing;
}
