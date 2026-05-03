package com.datapulse.service;

import com.datapulse.domain.Shipment;
import com.datapulse.domain.enums.ShipmentStatus;
import com.datapulse.repository.ShipmentRepository;
import com.datapulse.web.dto.PageResponse;
import com.datapulse.web.dto.ShipmentResponse;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ShipmentService {

    private final ShipmentRepository shipmentRepository;

    public ShipmentService(ShipmentRepository shipmentRepository) {
        this.shipmentRepository = shipmentRepository;
    }

    public PageResponse<ShipmentResponse> getShipments() {
        List<Shipment> shipments = shipmentRepository.findAll();
        List<ShipmentResponse> responses = shipments.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        return PageResponse.of(responses);
    }

    private ShipmentResponse toResponse(Shipment s) {
        String orderId = (s.getOrder() != null) ? "#ORD-" + String.format("%04d", s.getOrder().getId()) : "N/A";
        String customer = "Unknown";
        if (s.getOrder() != null && s.getOrder().getUser() != null) {
            customer = deriveNameFromEmail(s.getOrder().getUser().getEmail());
        }
        String eta = (s.getEta() != null)
                ? s.getEta().format(DateTimeFormatter.ofPattern("MMM d")) : "N/A";
        String status = formatStatus(s.getStatus());

        return new ShipmentResponse(
                s.getTrackingId() != null ? s.getTrackingId() : "TRK-000000",
                orderId, customer,
                s.getCarrier() != null ? s.getCarrier() : "Unknown",
                s.getDestination() != null ? s.getDestination() : "Unknown",
                status, eta
        );
    }

    private String formatStatus(ShipmentStatus status) {
        if (status == null) return "Processing";
        return switch (status) {
            case IN_TRANSIT -> "In Transit";
            case PROCESSING -> "Processing";
            case DELIVERED -> "Delivered";
            case RETURNED -> "Returned";
        };
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
}
