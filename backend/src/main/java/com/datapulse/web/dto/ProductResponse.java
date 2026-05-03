package com.datapulse.web.dto;

import java.math.BigDecimal;

public class ProductResponse {
    private Long id;
    private String name;
    private String category;
    private String sku;
    private BigDecimal price;
    private int stock;
    private String icon;

    public ProductResponse(Long id, String name, String category, String sku,
                           BigDecimal price, int stock, String icon) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.sku = sku;
        this.price = price;
        this.stock = stock;
        this.icon = icon;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getCategory() { return category; }
    public String getSku() { return sku; }
    public BigDecimal getPrice() { return price; }
    public int getStock() { return stock; }
    public String getIcon() { return icon; }
}
