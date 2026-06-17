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
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @PostMapping("/sessions")
    public ResponseEntity<ApiResponse<ChatSessionDto>> getOrCreateSession(
            @RequestParam Integer docId,
            Authentication authentication) {
        String accountName = authentication.getName();
        ChatSessionDto session = chatService.getOrCreateSession(docId, accountName);
        return ResponseEntity.ok(ApiResponse.success("Success", session));
    }

    @PostMapping("/sessions/{sessionId}/messages")
    public ResponseEntity<ApiResponse<ChatMessageDto>> sendMessage(
            @PathVariable Integer sessionId,
            @RequestBody ChatRequest request,
            Authentication authentication) {
        String accountName = authentication.getName();
        ChatMessageDto response = chatService.sendMessage(sessionId, request, accountName);
        return ResponseEntity.ok(ApiResponse.success("Success", response));
    }
}
