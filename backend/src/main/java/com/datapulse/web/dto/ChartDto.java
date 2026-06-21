package com.datapulse.web.dto;

import java.util.List;

public class ChartDto {
    private List<String> labels;
    private List<? extends Number> data; // Liste tipini biraz daha esnettik

    public ChartDto(List<String> labels, List<? extends Number> data) {
        this.labels = labels;
        this.data = data;
    }

    public List<String> getLabels() { return labels; }
    public List<? extends Number> getData() { return data; }
}