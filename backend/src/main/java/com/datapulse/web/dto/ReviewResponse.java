package com.datapulse.web.dto;

public class ReviewResponse {
    private Long id;
    private String customer;
    private String initials;
    private String product;
    private int rating;
    private String comment;
    private String date;
    private int helpful;

    public ReviewResponse(Long id, String customer, String initials, String product,
                          int rating, String comment, String date, int helpful) {
        this.id = id;
        this.customer = customer;
        this.initials = initials;
        this.product = product;
        this.rating = rating;
        this.comment = comment;
        this.date = date;
        this.helpful = helpful;
    }

    public Long getId() { return id; }
    public String getCustomer() { return customer; }
    public String getInitials() { return initials; }
    public String getProduct() { return product; }
    public int getRating() { return rating; }
    public String getComment() { return comment; }
    public String getDate() { return date; }
    public int getHelpful() { return helpful; }
}
