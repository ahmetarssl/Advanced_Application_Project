package com.datapulse.web.dto;

public class KpiDto {
    private String title;
    private String value;
    private String trend;
    private boolean isPositive;
    private String icon;
    private String colorClass;

    public KpiDto(String title, String value, String trend, boolean isPositive, String icon, String colorClass) {
        this.title = title;
        this.value = value;
        this.trend = trend;
        this.isPositive = isPositive;
        this.icon = icon;
        this.colorClass = colorClass;
    }

    public String getTitle() { return title; }
    public String getValue() { return value; }
    public String getTrend() { return trend; }
    public boolean isPositive() { return isPositive; }
    public String getIcon() { return icon; }
    public String getColorClass() { return colorClass; }
}
