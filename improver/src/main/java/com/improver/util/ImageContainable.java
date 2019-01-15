package com.improver.util;

public interface ImageContainable {

    ImageContainable setCoverUrl(String imageCoverUrl);

    String getCoverUrl();

    default boolean hasCover(){
        return !(getCoverUrl() == null || getCoverUrl().isEmpty());
    }
}
