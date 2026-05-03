package com.datapulse.ai;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AiQueryAuditRepository extends JpaRepository<AiQueryAudit, Long> {
}