package com.datapulse.repository;

import com.datapulse.domain.Store;
import com.datapulse.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface StoreRepository extends JpaRepository<Store, Long> {
    List<Store> findByOwner(User owner);
    Optional<Store> findByOwnerAndId(User owner, Long id);

    @Query("SELECT COALESCE(SUM(s.revenue), 0) FROM Store s")
    BigDecimal sumTotalRevenue();
}
