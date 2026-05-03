package com.datapulse.web.dto;

public class CustomerResponse {
    private Long id;
    private String name;
    private String initials;
    private String city;
    private String membership;
    private String totalSpend;
    private int orders;
    private String status;

    public CustomerResponse(Long id, String name, String initials, String city,
                            String membership, String totalSpend, int orders, String status) {
        this.id = id;
        this.name = name;
        this.initials = initials;
        this.city = city;
        this.membership = membership;
        this.totalSpend = totalSpend;
        this.orders = orders;
        this.status = status;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getInitials() { return initials; }
    public String getCity() { return city; }
    public String getMembership() { return membership; }
    public String getTotalSpend() { return totalSpend; }
    public int getOrders() { return orders; }
    public String getStatus() { return status; }
}
