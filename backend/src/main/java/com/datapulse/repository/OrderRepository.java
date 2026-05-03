package com.datapulse.repository;

import com.datapulse.domain.Order;
import com.datapulse.domain.Store;
import com.datapulse.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUser(User user);
    List<Order> findByStore(Store store);

    @Query("SELECT COALESCE(SUM(o.grandTotal), 0) FROM Order o WHERE o.store = :store")
    BigDecimal sumRevenueByStore(Store store);

    @Query("SELECT COALESCE(SUM(o.grandTotal), 0) FROM Order o")
    BigDecimal sumTotalRevenue();

    long countByStore(Store store);
}
