package com.datapulse.web.dto;

import jakarta.validation.constraints.*;
import java.util.List;

public class CheckoutDtos {

    public record CheckoutItem(
            @NotNull Long productId,
            @Min(1) @Max(99) int quantity
    ) {}

    public record CheckoutRequest(
            @NotEmpty List<CheckoutItem> items,
            @NotBlank @Size(max=120) String customerName,
            @NotBlank @Size(max=300) String shippingAddress,
            @Pattern(regexp="\\d{4}", message="4 hane")
            String cardLast4,
            @NotBlank @Pattern(regexp="CARD|CASH|TRANSFER")
            String paymentMethod
    ) {}

    public record CheckoutResponse(
            Long orderId,
            String message,
            java.math.BigDecimal grandTotal
    ) {}
}