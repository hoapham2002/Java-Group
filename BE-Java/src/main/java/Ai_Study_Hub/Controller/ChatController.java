package Ai_Study_Hub.Controller;

import Ai_Study_Hub.Domain.dto.ChatMessageDto;
import Ai_Study_Hub.Domain.dto.ChatRequest;
import Ai_Study_Hub.Domain.dto.ChatSessionDto;
import Ai_Study_Hub.Service.ChatService;
import Ai_Study_Hub.Util.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @PostMapping("/sessions")
    public ResponseEntity<ApiResponse<ChatSessionDto>> getOrCreateSession(
            @RequestParam Integer docId,
            Authentication authentication) {
        try {
            String accountName = authentication.getName();
            ChatSessionDto session = chatService.getOrCreateSession(docId, accountName);
            return ResponseEntity.ok(ApiResponse.success("Success", session));
        } catch (Exception e) {
            log.error("Error getting or creating chat session", e);
            return ResponseEntity.internalServerError().body(ApiResponse.error(500, e.getMessage()));
        }
    }

    @PostMapping("/sessions/{sessionId}/messages")
    public ResponseEntity<ApiResponse<ChatMessageDto>> sendMessage(
            @PathVariable Integer sessionId,
            @RequestBody ChatRequest request,
            Authentication authentication) {
        try {
            String accountName = authentication.getName();
            ChatMessageDto response = chatService.sendMessage(sessionId, request, accountName);
            return ResponseEntity.ok(ApiResponse.success("Success", response));
        } catch (Exception e) {
            log.error("Error sending message", e);
            return ResponseEntity.internalServerError().body(ApiResponse.error(500, e.getMessage()));
        }
    }
}
