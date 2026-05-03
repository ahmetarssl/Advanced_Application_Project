package com.datapulse.service;

import com.datapulse.domain.CustomerProfile;
import com.datapulse.repository.CustomerProfileRepository;
import com.datapulse.web.dto.CustomerResponse;
import com.datapulse.web.dto.PageResponse;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CustomerService {

    private final CustomerProfileRepository customerProfileRepository;

    public CustomerService(CustomerProfileRepository customerProfileRepository) {
        this.customerProfileRepository = customerProfileRepository;
    }

    public PageResponse<CustomerResponse> getCustomers() {
        List<CustomerProfile> profiles = customerProfileRepository.findAll();
        List<CustomerResponse> responses = profiles.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        return PageResponse.of(responses);
    }

    private CustomerResponse toResponse(CustomerProfile cp) {
        String name = (cp.getName() != null && !cp.getName().isBlank()) ? cp.getName() : deriveNameFromEmail(cp);
        String initials = buildInitials(name);
        String city = cp.getCity() != null ? cp.getCity() : "Unknown";
        String membership = cp.getMembershipType() != null ? cp.getMembershipType() : "Bronze";
        String spend = cp.getTotalSpend() != null ? String.format("$%.2f", cp.getTotalSpend()) : "$0.00";
        int orders = cp.getItemsPurchased() != null ? cp.getItemsPurchased() : 0;
        String status = Boolean.TRUE.equals(cp.getIsActive()) ? "Active" : "Inactive";

        return new CustomerResponse(cp.getId(), name, initials, city, membership, spend, orders, status);
    }

    private String deriveNameFromEmail(CustomerProfile cp) {
        if (cp.getUser() == null) return "Unknown";
        String email = cp.getUser().getEmail();
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
}
