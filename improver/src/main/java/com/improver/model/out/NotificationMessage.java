package com.improver.model.out;

import com.improver.entity.Notification;
import com.improver.util.serializer.SerializationUtil;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@RequiredArgsConstructor
public class NotificationMessage {

    private final Type type;
    private final Object body;

    public static NotificationMessage balance(int balance, boolean isSubscriptionOn, int reserve){
        return new NotificationMessage(Type.BILLING, new BillingInfo(balance, isSubscriptionOn, reserve));
    }

    public static NotificationMessage plain(Notification notification){
        return new NotificationMessage(Type.PLAIN, notification);
    }

    public String
    toJson(){
        return SerializationUtil.toJson(this);
    }


    @Data
    @RequiredArgsConstructor
    public static class BillingInfo {
        private final int balance;
        private final boolean isSubscriptionOn;
        private final int reserve;
    }

    /**
     * User role enum
     */
    public enum Type {
        BILLING("BILLING"),
        PLAIN ("PLAIN");

        private final String value;

        Type(String type) {
            value = type;
        }
    }
}
