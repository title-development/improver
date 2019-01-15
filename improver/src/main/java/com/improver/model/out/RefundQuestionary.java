package com.improver.model.out;

import com.improver.entity.Refund;
import lombok.Data;
import lombok.experimental.Accessors;

import java.util.List;

@Data
@Accessors(chain = true)
public class RefundQuestionary {

    private String zip;
    private String serviceName;
    private List<Issue> issues;

    @Data
    @Accessors(chain = true)
    public static class Issue {
        private Refund.Issue name;
        private String text;
        private String question;
        private List<Option> options;
    }

    @Data
    @Accessors(chain = true)
    public static class Option {
        private Refund.Option name;
        private String text;
    }
}
