package Ai_Study_Hub.Controller;

import Ai_Study_Hub.Domain.dto.ChatMessageDto;
import Ai_Study_Hub.Domain.dto.ChatRequest;
import Ai_Study_Hub.Domain.dto.ChatSessionDto;
import Ai_Study_Hub.Service.ChatService;
import Ai_Study_Hub.Util.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @PostMapping("/sessions")
    public ResponseEntity<ApiResponse<ChatSessionDto>> getOrCreateSession(
            @RequestParam("docId") Integer docId,
            Authentication authentication) {
        String accountName = authentication.getName();
        ChatSessionDto session = chatService.getOrCreateSession(docId, accountName);
        return ResponseEntity.ok(ApiResponse.success("Success", session));
    }

    @PostMapping("/sessions/{sessionId}/messages")
    public ResponseEntity<ApiResponse<ChatMessageDto>> sendMessage(
            @PathVariable("sessionId") Integer sessionId,
            @RequestBody ChatRequest request,
            Authentication authentication) {
        String accountName = authentication.getName();
        ChatMessageDto response = chatService.sendMessage(sessionId, request, accountName);
        return ResponseEntity.ok(ApiResponse.success("Success", response));
    }
    // API lấy toàn bộ lịch sử các phiên chat cho Admin
    @GetMapping("/admin/sessions")
    @PreAuthorize("hasRole('ADMIN')") // Phân quyền chỉ cho tài khoản ADMIN truy cập
    public ResponseEntity<ApiResponse<List<ChatSessionDto>>> getAllSessionsForAdmin() {
        List<ChatSessionDto> data = chatService.getAllSessionsForAdmin();
        
        // Thay vì dùng setStatusCode, ta dùng hàm static success tương tự như các hàm phía trên của bạn
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách giám sát Chat AI thành công", data));
    }

    // API xóa phiên chat vi phạm
    @DeleteMapping("/admin/sessions/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    // Đổi kiểu dữ liệu từ Long sang Integer ở @PathVariable để khớp với ChatService
    public ResponseEntity<ApiResponse<Void>> deleteChatSessionByAdmin(@PathVariable("id") Integer sessionId) {
        chatService.deleteSessionByAdmin(sessionId);
        
        // Trả về response dạng success với data là null (vì kiểu Void)
        return ResponseEntity.ok(ApiResponse.success("Xóa phiên chat thành công", null));
    }
}
