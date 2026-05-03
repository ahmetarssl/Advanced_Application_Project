package com.datapulse.ai;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @PostMapping("/ask")
    @PreAuthorize("hasAnyRole('ADMIN', 'CORPORATE', 'INDIVIDUAL')")
    public ResponseEntity<ChatService.ChatResponse> ask(@Valid @RequestBody AskRequest req) {
        return ResponseEntity.ok(chatService.ask(req.question()));
    }

    public record AskRequest(
            @NotBlank @Size(max = 500) String question
    ) { }
}