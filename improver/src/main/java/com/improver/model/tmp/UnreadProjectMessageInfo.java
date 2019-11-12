package com.improver.model.tmp;

import lombok.Data;

@Data
public class UnreadProjectMessageInfo {

    private String recipientEmail;
    private String serviceTypeName;
    private Long projectId;
    private Long projectRequestId;
    private String clientName;
    private String companyName;

    public UnreadProjectMessageInfo(String recipientEmail, String serviceTypeName, Long projectId, Long projectRequestId, String companyName) {
        this.recipientEmail = recipientEmail;
        this.serviceTypeName = serviceTypeName;
        this.projectId = projectId;
        this.projectRequestId = projectRequestId;
        this.companyName = companyName;
    }

    public UnreadProjectMessageInfo(String recipientEmail, String serviceTypeName, Long projectRequestId, String clientName) {
        this.recipientEmail = recipientEmail;
        this.serviceTypeName = serviceTypeName;
        this.projectRequestId = projectRequestId;
        this.clientName = clientName;
    }

}
