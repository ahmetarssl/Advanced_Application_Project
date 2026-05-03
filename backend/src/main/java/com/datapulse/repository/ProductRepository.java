package com.datapulse.repository;

import com.datapulse.domain.Product;
import com.datapulse.domain.Store;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByStore(Store store);
    long countByStore(Store store);
}
