package com.datapulse.repository;

import com.datapulse.domain.Order;
import com.datapulse.domain.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findByOrder(Order order);
    long countByOrder(Order order);
}
