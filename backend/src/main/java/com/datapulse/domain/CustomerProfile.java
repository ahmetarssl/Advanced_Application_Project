package com.datapulse.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "customer_profiles")
public class CustomerProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    private String name;
    private Integer age;
    private String city;
    private String membershipType;
    private BigDecimal totalSpend = BigDecimal.ZERO;
    private Integer itemsPurchased = 0;
    private Double avgRating;
    private String satisfactionLevel;
    private Boolean isActive = true;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public String getMembershipType() { return membershipType; }
    public void setMembershipType(String membershipType) { this.membershipType = membershipType; }
    public BigDecimal getTotalSpend() { return totalSpend; }
    public void setTotalSpend(BigDecimal totalSpend) { this.totalSpend = totalSpend; }
    public Integer getItemsPurchased() { return itemsPurchased; }
    public void setItemsPurchased(Integer itemsPurchased) { this.itemsPurchased = itemsPurchased; }
    public Double getAvgRating() { return avgRating; }
    public void setAvgRating(Double avgRating) { this.avgRating = avgRating; }
    public String getSatisfactionLevel() { return satisfactionLevel; }
    public void setSatisfactionLevel(String satisfactionLevel) { this.satisfactionLevel = satisfactionLevel; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}
