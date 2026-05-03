package com.datapulse.web.dto;

public class OrderResponse {
    private String id;
    private String customer;
    private String initials;
    private int products;
    private String total;
    private String date;
    private String status;

    public OrderResponse(String id, String customer, String initials, int products,
                         String total, String date, String status) {
        this.id = id;
        this.customer = customer;
        this.initials = initials;
        this.products = products;
        this.total = total;
        this.date = date;
        this.status = status;
    }

    public String getId() { return id; }
    public String getCustomer() { return customer; }
    public String getInitials() { return initials; }
    public int getProducts() { return products; }
    public String getTotal() { return total; }
    public String getDate() { return date; }
    public String getStatus() { return status; }
}
