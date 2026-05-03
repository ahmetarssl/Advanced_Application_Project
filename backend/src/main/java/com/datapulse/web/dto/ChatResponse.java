package com.datapulse.web.dto;

public class ChatResponse {
    private String answer;
    private boolean hasChart;
    private Object chartData;
    private String sql;

    public ChatResponse(String answer, boolean hasChart, Object chartData, String sql) {
        this.answer = answer;
        this.hasChart = hasChart;
        this.chartData = chartData;
        this.sql = sql;
    }

    public String getAnswer() { return answer; }
    public boolean isHasChart() { return hasChart; }
    public Object getChartData() { return chartData; }
    public String getSql() { return sql; }
}
