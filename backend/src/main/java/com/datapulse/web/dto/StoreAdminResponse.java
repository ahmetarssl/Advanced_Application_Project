package com.datapulse.web.dto;

public class StoreAdminResponse {
    private Long id;
    private String name;
    private String owner;
    private String category;
    private String revenue;
    private long products;
    private String status;
    private String joinDate;

    public StoreAdminResponse(Long id, String name, String owner, String category,
                              String revenue, long products, String status, String joinDate) {
        this.id = id;
        this.name = name;
        this.owner = owner;
        this.category = category;
        this.revenue = revenue;
        this.products = products;
        this.status = status;
        this.joinDate = joinDate;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getOwner() { return owner; }
    public String getCategory() { return category; }
    public String getRevenue() { return revenue; }
    public long getProducts() { return products; }
    public String getStatus() { return status; }
    public String getJoinDate() { return joinDate; }
}
