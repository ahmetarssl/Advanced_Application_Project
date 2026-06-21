package com.datapulse.service;

import com.datapulse.domain.User;
import com.datapulse.repository.UserRepository;
import com.datapulse.web.dto.CheckoutDtos.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.math.BigDecimal;
import java.sql.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class CheckoutService {

    @Qualifier("appDataSource")
    private final DataSource appDataSource;
    private final UserRepository userRepository;

    @Transactional
    public CheckoutResponse checkout(CheckoutRequest req, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Kullanici bulunamadi"));

        try (Connection c = appDataSource.getConnection()) {
            c.setAutoCommit(false);

            // 1) Urun fiyatlarini cek + grand_total hesapla
            BigDecimal grandTotal = BigDecimal.ZERO;
            Long firstStoreId = null;
            for (CheckoutItem it : req.items()) {
                BigDecimal price;
                Long storeId;
                try (PreparedStatement ps = c.prepareStatement(
                        "SELECT price, store_id FROM products WHERE id = ?")) {
                    ps.setLong(1, it.productId());
                    try (ResultSet rs = ps.executeQuery()) {
                        if (!rs.next()) {
                            throw new RuntimeException("Urun bulunamadi: " + it.productId());
                        }
                        price = rs.getBigDecimal(1);
                        storeId = rs.getLong(2);
                    }
                }
                grandTotal = grandTotal.add(price.multiply(BigDecimal.valueOf(it.quantity())));
                if (firstStoreId == null) firstStoreId = storeId;
            }

            // 2) orders'a INSERT
            long orderId;
            try (PreparedStatement ps = c.prepareStatement(
                    "INSERT INTO orders (user_id, store_id, total, grand_total, order_date, " +
                    "created_at, status, product_count, payment_method) " +
                    "VALUES (?, ?, ?, ?, NOW(), NOW(), 'PENDING', ?, ?) RETURNING id")) {
                ps.setLong(1, user.getId());
                ps.setLong(2, firstStoreId);
                ps.setBigDecimal(3, grandTotal);
                ps.setBigDecimal(4, grandTotal);
                ps.setInt(5, req.items().stream().mapToInt(CheckoutItem::quantity).sum());
                ps.setString(6, req.paymentMethod());
                try (ResultSet rs = ps.executeQuery()) {
                    rs.next();
                    orderId = rs.getLong(1);
                }
            }

            // 3) order_items'a tek tek INSERT
            try (PreparedStatement ps = c.prepareStatement(
                    "INSERT INTO order_items (order_id, product_id, quantity, unit_price, price) " +
                    "SELECT ?, p.id, ?, p.price, p.price FROM products p WHERE p.id = ?")) {
                for (CheckoutItem it : req.items()) {
                    ps.setLong(1, orderId);
                    ps.setInt(2, it.quantity());
                    ps.setLong(3, it.productId());
                    ps.addBatch();
                }
                ps.executeBatch();
            }

            // 4) Shipment olustur
            try (PreparedStatement ps = c.prepareStatement(
                    "INSERT INTO shipments (tracking_id, order_id, carrier, destination, status, " +
                    "eta, mode_of_shipment, warehouse_block) " +
                    "VALUES (?, ?, 'Yurtici Kargo', ?, 'PROCESSING', CURRENT_DATE + INTERVAL '5 days', 'ROAD', 'A')")) {
                ps.setString(1, "TRK-" + String.format("%06d", orderId));
                ps.setLong(2, orderId);
                ps.setString(3, req.shippingAddress());
                ps.executeUpdate();
            }

            c.commit();
            log.info("Checkout success - user={}, order={}, total={}", user.getId(), orderId, grandTotal);

            return new CheckoutResponse(orderId,
                    "Siparisiniz alindi. Kart son 4 hane: " + (req.cardLast4() != null ? req.cardLast4() : "----"),
                    grandTotal);

        } catch (SQLException e) {
            log.error("Checkout failed", e);
            throw new RuntimeException("Siparis olusturulamadi: " + e.getMessage(), e);
        }
    }
}