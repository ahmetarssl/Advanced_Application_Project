package com.datapulse.repository;

import com.datapulse.domain.Shipment;
import com.datapulse.domain.enums.ShipmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ShipmentRepository extends JpaRepository<Shipment, Long> {
    Optional<Shipment> findByTrackingId(String trackingId);
    List<Shipment> findByStatus(ShipmentStatus status);
}
