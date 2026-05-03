package com.datapulse.web.dto;

import java.util.List;

public class DashboardStatsResponse {
    private List<KpiDto> kpis;

    public DashboardStatsResponse(List<KpiDto> kpis) {
        this.kpis = kpis;
    }

    public List<KpiDto> getKpis() { return kpis; }
}
