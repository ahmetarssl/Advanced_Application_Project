package com.datapulse.service;

import com.datapulse.domain.Store;
import com.datapulse.domain.User;
import com.datapulse.repository.OrderRepository;
import com.datapulse.repository.ProductRepository;
import com.datapulse.repository.StoreRepository;
import com.datapulse.repository.UserRepository;
import com.datapulse.web.dto.StoreAdminResponse;
import com.datapulse.web.dto.UserAdminResponse;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final StoreRepository storeRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;

    public AdminService(UserRepository userRepository, StoreRepository storeRepository,
                        ProductRepository productRepository, OrderRepository orderRepository) {
        this.userRepository = userRepository;
        this.storeRepository = storeRepository;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
    }

    public List<UserAdminResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toUserResponse)
                .collect(Collectors.toList());
    }

    public List<StoreAdminResponse> getAllStores() {
        return storeRepository.findAll().stream()
                .map(this::toStoreResponse)
                .collect(Collectors.toList());
    }

    private UserAdminResponse toUserResponse(User u) {
        String name = deriveNameFromEmail(u.getEmail());
        String initials = buildInitials(name);
        String status = Boolean.TRUE.equals(u.getIsActive()) ? "Active" : "Suspended";
        long orders = orderRepository.findByUser(u).size();
        return new UserAdminResponse(u.getId(), u.getEmail(), initials,
                u.getRoleType().name(), status, "N/A", orders);
    }

    private StoreAdminResponse toStoreResponse(Store s) {
        String ownerEmail = (s.getOwner() != null) ? s.getOwner().getEmail() : "Unknown";
        String ownerName = deriveNameFromEmail(ownerEmail);
        long productCount = productRepository.countByStore(s);
        String revenue = s.getRevenue() != null ? String.format("$%.2f", s.getRevenue()) : "$0.00";
        String joinDate = (s.getJoinDate() != null)
                ? s.getJoinDate().format(DateTimeFormatter.ofPattern("MMM d, yyyy")) : "N/A";
        String status = s.getStatus() != null ? capitalize(s.getStatus().name()) : "Pending";

        return new StoreAdminResponse(s.getId(), s.getName(), ownerName,
                s.getCategory() != null ? s.getCategory() : "General",
                revenue, productCount, status, joinDate);
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
        return s.charAt(0) + s.substring(1).toLowerCase();
    }
}
