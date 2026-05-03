package com.datapulse.web;

import com.datapulse.service.ShipmentService;
import com.datapulse.web.dto.PageResponse;
import com.datapulse.web.dto.ShipmentResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/shipments")
public class ShipmentController {

    private final ShipmentService shipmentService;

    public ShipmentController(ShipmentService shipmentService) {
        this.shipmentService = shipmentService;
    }

    @GetMapping
    public ResponseEntity<PageResponse<ShipmentResponse>> getShipments() {
        return ResponseEntity.ok(shipmentService.getShipments());
    }
}
