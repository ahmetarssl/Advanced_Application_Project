package com.datapulse.repository;

import com.datapulse.domain.Product;
import com.datapulse.domain.Review;
import com.datapulse.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByUser(User user);
    List<Review> findByProduct(Product product);

    @Query("SELECT COALESCE(AVG(r.starRating), 0) FROM Review r")
    Double avgRatingGlobal();

    @Query("SELECT COALESCE(AVG(r.starRating), 0) FROM Review r WHERE r.product.store.id = :storeId")
    Double avgRatingByStore(Long storeId);
}
