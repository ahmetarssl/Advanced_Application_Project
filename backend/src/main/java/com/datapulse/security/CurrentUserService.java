package com.datapulse.security;

import com.datapulse.domain.User;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class CurrentUserService {

    @PersistenceContext
    private EntityManager entityManager;

    public User requireUser() {
        // 1. Spring Security'den sisteme giriş yapan kişinin e-postasını al
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        // 2. Bu e-posta ile veritabanındaki tüm User nesnesini (Role, StoreID dahil) çek ve döndür
        return entityManager.createQuery("SELECT u FROM User u WHERE u.email = :email", User.class)
                .setParameter("email", email)
                .getSingleResult();
    }
}