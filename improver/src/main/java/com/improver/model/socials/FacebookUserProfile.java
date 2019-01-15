package com.improver.model.socials;

import lombok.Data;

@Data
public class FacebookUserProfile {
    private String id;
    private String email;
    private String first_name;
    private String last_name;
    private String name;
    private Picture picture;

    @Data
    public class Picture {
        private ProfilePicture data;

        @Data
        public class ProfilePicture {
            private int height;
            private int width;
            private boolean is_silhouette;
            private String url;
        }
    }
}
