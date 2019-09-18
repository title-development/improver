package com.improver.model.recapcha;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Data;

import java.util.List;

@Data
public class ReCaptchaResponse {
    private boolean success;

    @JsonProperty("challenge_ts")
    private String challengeTs;

    private String hostname;

    @JsonProperty("error-codes")
    private List<ErrorCode> errorCodes;

    public boolean hasError(ErrorCode error) {
        return errorCodes.contains(error);
    }

    public enum ErrorCode {
        MISSING_SECRET_KEY("missing-input-secret"),
        INVALID_SECRET_KEY("invalid-input-secret"),
        MISSING_USER_CAPTCHA_RESPONSE("missing-input-response"),
        INVALID_USER_CAPTCHA_RESPONSE("invalid-input-response"),
        BAD_REQUEST("bad-request"),
        TIMEOUT_OR_DUPLICATE("timeout-or-duplicate"),
        UNSUPPORTED_ERROR_CODE("unsupported_error_code");

        private final String value;


        ErrorCode(String status) {
            value = status;
        }

        public boolean equalsValue(String type) {
            return value.equals(type);
        }

        @Override
        public String toString() {
            return this.value;
        }

        @JsonCreator
        private static ErrorCode fromValue(String value) {
            if (value == null) {
                return null;
            }
            switch (value) {
                case "missing-input-secret":
                    return MISSING_SECRET_KEY;
                case "invalid-input-secret":
                    return INVALID_SECRET_KEY;
                case "missing-input-response":
                    return MISSING_USER_CAPTCHA_RESPONSE;
                case "invalid-input-response":
                    return INVALID_USER_CAPTCHA_RESPONSE;
                case "bad-request":
                    return BAD_REQUEST;
                case "timeout-or-duplicate":
                    return TIMEOUT_OR_DUPLICATE;
                default:
                    return UNSUPPORTED_ERROR_CODE;
            }
        }

        @JsonValue
        public String getValue() {
            return value;
        }
    }

    @Override
    public String toString() {
        return "ReCaptchaResponse{" +
            "success=" + success +
            ", errorCodes=" + errorCodes +
            '}';
    }
}
