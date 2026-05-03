package com.datapulse.ai;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * 03_security.sql icindeki ai_query_audit tablosunun JPA karsiligi.
 */
@Getter
@Setter
@Entity
@Table(name = "ai_query_audit")
public class AiQueryAudit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "queried_at", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime queriedAt;

    @Column(name = "app_user_id")
    private Long appUserId;

    @Column(name = "app_role", length = 30)
    private String appRole;

    @Column(name = "question", columnDefinition = "TEXT")
    private String question;

    @Column(name = "sql_query", columnDefinition = "TEXT")
    private String sqlQuery;

    @Column(name = "row_count")
    private Integer rowCount;

    @Column(name = "duration_ms")
    private Integer durationMs;

    @Column(name = "blocked")
    private Boolean blocked = false;

    @Column(name = "block_reason", length = 500)
    private String blockReason;
}