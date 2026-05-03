package com.datapulse.web.dto;

public class UserAdminResponse {
    private Long id;
    private String email;
    private String initials;
    private String role;
    private String status;
    private String joinDate;
    private long orders;

    public UserAdminResponse(Long id, String email, String initials, String role,
                             String status, String joinDate, long orders) {
        this.id = id;
        this.email = email;
        this.initials = initials;
        this.role = role;
        this.status = status;
        this.joinDate = joinDate;
        this.orders = orders;
    }

    public Long getId() { return id; }
    public String getEmail() { return email; }
    public String getInitials() { return initials; }
    public String getRole() { return role; }
    public String getStatus() { return status; }
    public String getJoinDate() { return joinDate; }
    public long getOrders() { return orders; }
}
