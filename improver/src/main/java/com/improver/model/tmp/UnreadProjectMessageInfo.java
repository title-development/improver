package com.improver.model.tmp;

import lombok.Data;

@Data
public class UnreadProjectMessageInfo {

    String recipientEmail;
    String serviceTypeName;
    String clientName;

    public UnreadProjectMessageInfo(String recipientEmail, String serviceTypeName) {
        this.recipientEmail = recipientEmail;
        this.serviceTypeName = serviceTypeName;
    }

    public UnreadProjectMessageInfo(String recipientEmail, String serviceTypeName, String clientName) {
        this.recipientEmail = recipientEmail;
        this.serviceTypeName = serviceTypeName;
        this.clientName = clientName;
    }

}
