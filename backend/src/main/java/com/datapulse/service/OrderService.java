package com.datapulse.service;

import com.datapulse.domain.Order;
import com.datapulse.domain.Store;
import com.datapulse.domain.User;
import com.datapulse.domain.enums.Role;
import com.datapulse.repository.OrderItemRepository;
import com.datapulse.repository.OrderRepository;
import com.datapulse.repository.StoreRepository;
import com.datapulse.web.dto.OrderResponse;
import com.datapulse.web.dto.PageResponse;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final StoreRepository storeRepository;

    public OrderService(OrderRepository orderRepository, OrderItemRepository orderItemRepository,
                        StoreRepository storeRepository) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.storeRepository = storeRepository;
    }

    public PageResponse<OrderResponse> getOrders(User user) {
        List<Order> orders;

        if (user.getRoleType() == Role.ADMIN) {
            orders = orderRepository.findAll();
        } else if (user.getRoleType() == Role.CORPORATE) {
            List<Store> stores = storeRepository.findByOwner(user);
            if (stores.isEmpty()) return PageResponse.of(List.of());
            orders = orderRepository.findByStore(stores.get(0));
        } else {
            orders = orderRepository.findByUser(user);
        }

        List<OrderResponse> responses = orders.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        return PageResponse.of(responses);
    }

    private OrderResponse toResponse(Order o) {
        String customerEmail = (o.getUser() != null) ? o.getUser().getEmail() : "Unknown";
        String customerName = deriveNameFromEmail(customerEmail);
        String initials = buildInitials(customerName);
        long itemCount = orderItemRepository.countByOrder(o);
        String total = String.format("$%.2f", o.getGrandTotal());
        String date = (o.getCreatedAt() != null)
                ? o.getCreatedAt().format(DateTimeFormatter.ofPattern("MMM d, yyyy")) : "";
        String status = capitalize(o.getStatus().name());
        String orderId = "#ORD-" + String.format("%04d", o.getId());

        return new OrderResponse(orderId, customerName, initials, (int) itemCount, total, date, status);
    }

    private String deriveNameFromEmail(String email) {
        String localPart = email.split("@")[0];
        String[] parts = localPart.replace(".", " ").replace("_", " ").split(" ");
        StringBuilder sb = new StringBuilder();
        for (String part : parts) {
            if (!part.isEmpty()) {
                sb.append(Character.toUpperCase(part.charAt(0)))
                  .append(part.substring(1).toLowerCase()).append(" ");
            }
        }
        return sb.toString().trim();
    }

    private String buildInitials(String name) {
        String[] parts = name.split(" ");
        if (parts.length >= 2) return "" + parts[0].charAt(0) + parts[1].charAt(0);
        return name.isEmpty() ? "?" : String.valueOf(name.charAt(0));
    }

    private String capitalize(String s) {
        if (s == null || s.isEmpty()) return s;
        return s.charAt(0) + s.substring(1).toLowerCase().replace("_", " ");
    }
}
