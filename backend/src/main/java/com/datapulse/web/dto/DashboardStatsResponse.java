package com.datapulse.web.dto;

import java.util.List;

public class DashboardStatsResponse {
    private List<KpiDto> kpis;
    private ChartDto revenue;
    private ChartDto categories;

    // BOŞ CONSTRUCTOR (Spring için bazen gerekir)
    public DashboardStatsResponse() {}

    // SENİN KODUNUN ARADIĞI 3 PARAMETRELİ CONSTRUCTOR
    public DashboardStatsResponse(List<KpiDto> kpis, ChartDto revenue, ChartDto categories) {
        this.kpis = kpis;
        this.revenue = revenue;
        this.categories = categories;
    }

    // Getter ve Setterlar...
    public List<KpiDto> getKpis() { return kpis; }
    public void setKpis(List<KpiDto> kpis) { this.kpis = kpis; }
    public ChartDto getRevenue() { return revenue; }
    public void setRevenue(ChartDto revenue) { this.revenue = revenue; }
    public ChartDto getCategories() { return categories; }
    public void setCategories(ChartDto categories) { this.categories = categories; }
}