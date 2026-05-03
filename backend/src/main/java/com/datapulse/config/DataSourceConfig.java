package com.datapulse.config;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;

/**
 * Iki ayri PostgreSQL DataSource:
 *  - appDataSource         : postgres user, butun yetkiler  (CRUD operasyonlar)
 *  - aiReadOnlyDataSource  : ai_readonly user, sadece SELECT (AI servis sorgulari)
 *
 * AI servisi RLS context'ini set ederken bu ikinci datasource'u kullanir.
 * Boylece AI ne kadar yaratici olursa olsun:
 *   - DROP/DELETE/UPDATE/INSERT yapamaz (DB seviyesinde reddedilir)
 *   - Bagliyken bile baska kullanicinin satirini goremez (RLS)
 */
@Configuration
public class DataSourceConfig {

    @Primary
    @Bean(name = "appDataSource")
    @ConfigurationProperties(prefix = "spring.datasource.app")
    public DataSource appDataSource() {
        return DataSourceBuilder.create()
                .type(HikariDataSource.class)
                .build();
    }

    @Bean(name = "aiReadOnlyDataSource")
    @ConfigurationProperties(prefix = "spring.datasource.ai-readonly")
    public DataSource aiReadOnlyDataSource() {
        return DataSourceBuilder.create()
                .type(HikariDataSource.class)
                .build();
    }
}