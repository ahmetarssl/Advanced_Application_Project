package com.datapulse.service;

import com.datapulse.domain.Store;
import com.datapulse.domain.User;
import com.datapulse.domain.enums.Role;
import com.datapulse.repository.CustomerProfileRepository;
import com.datapulse.repository.OrderRepository;
import com.datapulse.repository.ReviewRepository;
import com.datapulse.repository.StoreRepository;
import com.datapulse.web.dto.ChartDto; // Yeni import
import com.datapulse.web.dto.DashboardStatsResponse;
import com.datapulse.web.dto.KpiDto;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.util.ArrayList;
import java.util.Arrays; // Yeni import
import java.util.List;
import java.util.Locale;

@Service
public class DashboardService {

    private final OrderRepository orderRepository;
    private final ReviewRepository reviewRepository;
    private final StoreRepository storeRepository;
    private final CustomerProfileRepository customerProfileRepository;

    public DashboardService(OrderRepository orderRepository, ReviewRepository reviewRepository,
                            StoreRepository storeRepository, CustomerProfileRepository customerProfileRepository) {
        this.orderRepository = orderRepository;
        this.reviewRepository = reviewRepository;
        this.storeRepository = storeRepository;
        this.customerProfileRepository = customerProfileRepository;
    }

    public DashboardStatsResponse getStats(User user) {
        List<KpiDto> kpis;

        if (user.getRoleType() == Role.ADMIN) {
            kpis = buildAdminKpis();
        } else if (user.getRoleType() == Role.CORPORATE) {
            kpis = buildCorporateKpis(user);
        } else {
            kpis = buildIndividualKpis(user);
        }

        // --- GRAFİK VERİLERİ BURADA OLUŞTURULUYOR ---
        ChartDto revenueChart = new ChartDto(
            Arrays.asList("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"),
            Arrays.asList(3200, 4500, 2900, 5100, 4800, 7200, 6100)
        );

        ChartDto categoryChart = new ChartDto(
            Arrays.asList("Fashion", "Electronics", "Home", "Beauty", "Sports"),
            Arrays.asList(35, 25, 20, 10, 10)
        );

        // Güncellenmiş constructor ile her şeyi paketleyip dönüyoruz
        return new DashboardStatsResponse(kpis, revenueChart, categoryChart);
    }

    private List<KpiDto> buildAdminKpis() {
        BigDecimal revenue = orderRepository.sumTotalRevenue();
        long totalOrders = orderRepository.count();
        long totalCustomers = customerProfileRepository.count();
        Double avgRating = reviewRepository.avgRatingGlobal();

        return List.of(
            new KpiDto("Total Revenue", formatCurrency(revenue), "+13.5%", true, "dollar", "revenue"),
            new KpiDto("Total Orders", String.valueOf(totalOrders), "+5.2%", true, "orders", "orders"),
            new KpiDto("Customers", String.valueOf(totalCustomers), "+24.35%", true, "customers", "customers"),
            new KpiDto("Avg Rating", String.format("%.1f", avgRating != null ? avgRating : 0.0), "+4.3%", true, "rating", "rating")
        );
    }

    private List<KpiDto> buildCorporateKpis(User user) {
        List<Store> stores = storeRepository.findByOwner(user);
        if (stores.isEmpty()) {
            return List.of(
                new KpiDto("Total Revenue", "$0", "0%", true, "dollar", "revenue"),
                new KpiDto("Total Orders", "0", "0%", true, "orders", "orders"),
                new KpiDto("Customers", "0", "0%", true, "customers", "customers"),
                new KpiDto("Avg Rating", "0.0", "0%", true, "rating", "rating")
            );
        }
        Store store = stores.get(0);
        BigDecimal revenue = orderRepository.sumRevenueByStore(store);
        long totalOrders = orderRepository.countByStore(store);
        long totalCustomers = customerProfileRepository.count();
        Double avgRating = reviewRepository.avgRatingByStore(store.getId());

        return List.of(
            new KpiDto("Total Revenue", formatCurrency(revenue), "+13.5%", true, "dollar", "revenue"),
            new KpiDto("Total Orders", String.valueOf(totalOrders), "+5.2%", true, "orders", "orders"),
            new KpiDto("Customers", String.valueOf(totalCustomers), "+24.35%", true, "customers", "customers"),
            new KpiDto("Avg Rating", String.format("%.1f", avgRating != null ? avgRating : 0.0), "+4.3%", true, "rating", "rating")
        );
    }

    private List<KpiDto> buildIndividualKpis(User user) {
        long myOrders = orderRepository.findByUser(user).size();
        return List.of(
            new KpiDto("My Orders", String.valueOf(myOrders), "0%", true, "orders", "orders"),
            new KpiDto("Avg Rating", "0.0", "0%", true, "rating", "rating")
        );
    }

    private String formatCurrency(BigDecimal amount) {
        if (amount == null) return "$0";
        NumberFormat formatter = NumberFormat.getCurrencyInstance(Locale.US);
        return formatter.format(amount);
    }
}
