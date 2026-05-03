package com.datapulse.ai;

import com.datapulse.domain.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiQueryService {

    @Qualifier("aiReadOnlyDataSource")
    private final DataSource aiDataSource;
    private final AiQueryAuditRepository auditRepo;

    public AiQueryResult runForUser(String sql, User user, String originalQuestion) {
        long start = System.currentTimeMillis();
        log.info("AI SQL execution starting for user {} (role={})", user.getId(), user.getRoleType());

        try (Connection c = aiDataSource.getConnection()) {
            c.setAutoCommit(false);

            try (Statement st = c.createStatement()) {
                st.execute("SET LOCAL app.user_role = '" + user.getRoleType().name() + "'");
                st.execute("SET LOCAL app.user_id   = '" + user.getId() + "'");
                if (user.getStoreId() != null) {
                    st.execute("SET LOCAL app.store_id = '" + user.getStoreId() + "'");
                }
            }

            List<Map<String, Object>> rows = new ArrayList<>();
            try (PreparedStatement ps = c.prepareStatement(sql);
                 ResultSet rs = ps.executeQuery()) {

                ResultSetMetaData md = rs.getMetaData();
                int cols = md.getColumnCount();
                while (rs.next()) {
                    Map<String, Object> row = new LinkedHashMap<>();
                    for (int i = 1; i <= cols; i++) {
                        row.put(md.getColumnLabel(i), rs.getObject(i));
                    }
                    rows.add(row);
                }
            }

            c.commit();
            long duration = System.currentTimeMillis() - start;
            log.info("AI SQL execution finished in {}ms, {} rows", duration, rows.size());

            tryAudit(user, originalQuestion, sql, rows.size(), duration, false, null);
            return new AiQueryResult(true, rows, null, duration);

        } catch (SQLException e) {
            long duration = System.currentTimeMillis() - start;
            log.warn("AI SQL execution failed for user {}: {}", user.getId(), e.getMessage());
            tryAudit(user, originalQuestion, sql, 0, duration, true, e.getMessage());
            return new AiQueryResult(false, List.of(), e.getMessage(), duration);
        }
    }

    private void tryAudit(User user, String question, String sql,
                          int rowCount, long durationMs, boolean blocked, String reason) {
        try {
            saveAudit(user, question, sql, rowCount, durationMs, blocked, reason);
        } catch (Exception ex) {
            log.error("Audit log yazilamadi (yok sayildi): {}", ex.getMessage());
        }
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void saveAudit(User user, String question, String sql,
                          int rowCount, long durationMs, boolean blocked, String reason) {
        AiQueryAudit a = new AiQueryAudit();
        a.setAppUserId(user.getId());
        a.setAppRole(user.getRoleType().name());
        a.setQuestion(truncate(question, 4000));
        a.setSqlQuery(truncate(sql, 8000));
        a.setRowCount(rowCount);
        a.setDurationMs((int) durationMs);
        a.setBlocked(blocked);
        a.setBlockReason(truncate(reason, 500));
        auditRepo.save(a);
    }

    private String truncate(String s, int max) {
        if (s == null) return null;
        return s.length() <= max ? s : s.substring(0, max);
    }

    public record AiQueryResult(boolean ok, List<Map<String, Object>> rows,
                                 String errorMessage, long durationMs) { }
}