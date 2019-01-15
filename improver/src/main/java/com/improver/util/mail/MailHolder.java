package com.improver.util.mail;

import lombok.Data;
import org.springframework.mail.javamail.MimeMessagePreparator;

@Data
public class MailHolder {

    private MimeMessagePreparator mimeMessagePreparator;
    private MessageType messageType;
    private int attempts = 0;

    public MailHolder(MimeMessagePreparator mimeMessagePreparator, MessageType messageType) {
        this.mimeMessagePreparator = mimeMessagePreparator;
        this.messageType = messageType;
    }

    /**
     * Message Type
     */
    public enum MessageType {
        INFO("INFO"),
        NOREPLY("NOREPLY"),
        BILLING("BILLING"),
        SUPPORT("SUPPORT");

        private final String value;

        MessageType(String value) {
            this.value = value;
        }

        public boolean equalsValue(String value) {
            return this.value.equals(value);
        }

        @Override
        public String toString() {
            return this.value;
        }

    }
}

