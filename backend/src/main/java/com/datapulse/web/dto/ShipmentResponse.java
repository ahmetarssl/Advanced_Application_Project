package com.datapulse.web.dto;

public class ShipmentResponse {
    private String trackingId;
    private String orderId;
    private String customer;
    private String carrier;
    private String destination;
    private String status;
    private String eta;

    public ShipmentResponse(String trackingId, String orderId, String customer,
                            String carrier, String destination, String status, String eta) {
        this.trackingId = trackingId;
        this.orderId = orderId;
        this.customer = customer;
        this.carrier = carrier;
        this.destination = destination;
        this.status = status;
        this.eta = eta;
    }

    public String getTrackingId() { return trackingId; }
    public String getOrderId() { return orderId; }
    public String getCustomer() { return customer; }
    public String getCarrier() { return carrier; }
    public String getDestination() { return destination; }
    public String getStatus() { return status; }
    public String getEta() { return eta; }
}
