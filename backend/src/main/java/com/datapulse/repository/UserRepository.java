package com.datapulse.repository;

import com.datapulse.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    // Veritabanından email'e göre kullanıcıyı bulmamızı sağlayan o sihirli kod
    Optional<User> findByEmail(String email);
}