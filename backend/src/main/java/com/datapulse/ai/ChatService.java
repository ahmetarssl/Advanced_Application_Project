package com.datapulse.ai;

import com.datapulse.domain.User;
import com.datapulse.security.CurrentUserService;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.List;
import java.util.Map;

/**
 * Frontend'den gelen /api/chat/ask isteklerini isleyen servis.
 *
 * AKIS:
 *   1. Su anki kullaniciyi al (JWT'den)
 *   2. AI service'e (FastAPI) HTTP cagrisi yap
 *      - question, user_id, user_role, store_id gonder
 *   3. AI service uretmis oldugu SQL'i geri donerse:
 *      AiQueryService.runForUser(...) ile RLS context icinde calistir
 *   4. AI'in dogal-dil cevabini ve grafik datasini frontend'e don
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ChatService {

    private final AiQueryService aiQueryService;
    private final CurrentUserService currentUserService;

    @Value("${app.ai-service.base-url}")
    private String aiServiceBaseUrl;

    public ChatResponse ask(String question) {
        User me = currentUserService.requireUser();

        WebClient client = WebClient.builder()
                .baseUrl(aiServiceBaseUrl)
                .build();

        // 1) AI service'e sor
Map<String, Object> requestBody = new java.util.HashMap<>();
requestBody.put("question", question);
requestBody.put("user_id", me.getId());
requestBody.put("user_role", me.getRoleType().name());
requestBody.put("store_id", me.getStoreId()); // HashMap null değerlere kızmaz!

System.out.println("--- PYTHON AI SERVISINE ISTEK ATILIYOR ---");

Map<String, Object> aiBody = client.post()
        .uri("/chat/ask")
        .bodyValue(requestBody)
        .retrieve()
        .bodyToMono(Map.class)
        .timeout(java.time.Duration.ofSeconds(60))
        .block();


        
        if (aiBody == null) {
            return ChatResponse.error("AI servisinden cevap alinamadi");
        }

        // AI service guardrail/validator engellediyse:
        Boolean blocked = (Boolean) aiBody.getOrDefault("blocked", false);
        if (Boolean.TRUE.equals(blocked)) {
            String reason = (String) aiBody.getOrDefault("reason", "Bu sorgu calistirilamaz");
            return ChatResponse.blocked(reason);
        }

        // 2) AI'in urettigi SQL'i RLS context icinde calistir
        String sql = (String) aiBody.get("sql");
        if (sql == null || sql.isBlank()) {
            // Greeting / out-of-scope - AI direkt cevap urettiyse
            return ChatResponse.text((String) aiBody.getOrDefault("answer", ""));
        }

        AiQueryService.AiQueryResult result =
                aiQueryService.runForUser(sql, me, question);

        if (!result.ok()) {
            return ChatResponse.error("Sorgu calistirilamadi: " + result.errorMessage());
        }

        // 3) AI'a sonucu yorumlatma istersen tekrar cagrilabilir;
        //    burada direkt geri donuyoruz
        return new ChatResponse(
                true,
                (String) aiBody.getOrDefault("answer", ""),
                result.rows(),
                aiBody.get("chart"),
                null
        );
    }

    public record ChatResponse(boolean ok, String answer,
                               List<Map<String, Object>> data,
                               Object chart, String error) {
        public static ChatResponse text(String t)    { return new ChatResponse(true,  t, List.of(), null, null); }
        public static ChatResponse error(String e)   { return new ChatResponse(false, null, List.of(), null, e); }
        public static ChatResponse blocked(String r) { return new ChatResponse(false, null, List.of(), null, "BLOCKED: " + r); }
    }
}