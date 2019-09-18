package com.improver.model.admin.in;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class ServedAreasUpdate {
    private List<String> added = new ArrayList<>();
    private List<String> removed = new ArrayList<>();
}
