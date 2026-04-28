package com.datapulse.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                // Tüm API yollarında bu ayarlara izin ver
                registry.addMapping("/**")
                        // Sadece senin Angular'ının çalıştığı adrese kapıyı aç
                        .allowedOrigins("http://localhost:4200")
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        // Token (JWT) gibi kimlik doğrulama bilgilerinin geçişine izin ver
                        .allowCredentials(true);
            }
        };
    }
}