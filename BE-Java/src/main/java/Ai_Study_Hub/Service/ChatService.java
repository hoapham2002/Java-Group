package Ai_Study_Hub.Service;

import Ai_Study_Hub.Domain.Account;
import Ai_Study_Hub.Domain.ChatMessage;
import Ai_Study_Hub.Domain.ChatSession;
import Ai_Study_Hub.Domain.Document;
import Ai_Study_Hub.Domain.dto.ChatMessageDto;
import Ai_Study_Hub.Domain.dto.ChatRequest;
import Ai_Study_Hub.Domain.dto.ChatSessionDto;
import Ai_Study_Hub.Domain.dto.AiChatRequest;
import Ai_Study_Hub.Domain.dto.AiChatResponse;
import Ai_Study_Hub.Domain.enums.MessageRole;
import Ai_Study_Hub.Repository.AccountRepository;
import Ai_Study_Hub.Repository.ChatMessageRepository;
import Ai_Study_Hub.Repository.ChatSessionRepository;
import Ai_Study_Hub.Repository.DocumentRepository;
import Ai_Study_Hub.Repository.DocumentShareRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatSessionRepository chatSessionRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final DocumentRepository documentRepository;
    private final AccountRepository accountRepository;
    private final DocumentShareRepository documentShareRepository;

    @Transactional
    public ChatSessionDto getOrCreateSession(Integer docId, String accountName) {
        Account account = accountRepository.findByAccountName(accountName)
                .orElseThrow(() -> new IllegalArgumentException("Account not found"));

        Document document = documentRepository.findById(docId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found"));

        boolean isOwner = document.getAccount().getAccountID() == account.getAccountID();
        if (!isOwner) {
            boolean isShared = documentShareRepository
                    .existsByDocument_DocIdAndSharedAccount_AccountIDAndIsActiveTrueAndExpiresAtAfter(
                            docId, account.getAccountID(), LocalDateTime.now());
            if (!isShared) {
                throw new IllegalArgumentException("You don't have permission to chat with this document");
            }
        }

        ChatSession session = chatSessionRepository.findTopByDocument_DocIdAndAccount_AccountIDOrderBySessionCreatedAtDesc(docId, account.getAccountID())
                .orElseGet(() -> {
                    ChatSession newSession = ChatSession.builder()
                            .sessionTitle("Chat với " + document.getDocOriginalName())
                            .sessionCreatedAt(LocalDateTime.now())
                            .isDeleted(false)
                            .account(account)
                            .document(document)
                            .messages(new ArrayList<>())
                            .build();
                    return chatSessionRepository.save(newSession);
                });

        return mapToDto(session);
    }

    @Transactional
    public ChatMessageDto sendMessage(Integer sessionId, ChatRequest request, String accountName) {
        ChatSession session = chatSessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found"));

        // 1. Lưu tin nhắn của user
        ChatMessage userMessage = ChatMessage.builder()
                .messRole(MessageRole.user)
                .messContent(request.getMessage())
                .messCreatedAt(LocalDateTime.now())
                .chatSession(session)
                .build();
        chatMessageRepository.save(userMessage);

        // 2. Gọi sang AI-Service (FastAPI)
        String aiResponseText;
        try {
            RestTemplate restTemplate = new RestTemplate();
            String aiApiUrl = "http://localhost:8000/chat";
            AiChatRequest aiReq = AiChatRequest.builder()
                    .docId(session.getDocument().getDocId())
                    .question(request.getMessage())
                    .build();
            AiChatResponse aiRes = restTemplate.postForObject(aiApiUrl, aiReq, AiChatResponse.class);
            aiResponseText = (aiRes != null && aiRes.getAnswer() != null) ? aiRes.getAnswer() : "Lỗi: Không nhận được phản hồi từ AI-Service.";
        } catch (Exception e) {
            log.error("Lỗi khi gọi AI-Service: ", e);
            aiResponseText = "Xin lỗi, hiện tại tôi không thể kết nối tới dịch vụ AI.";
        }
        
        // 3. Lưu tin nhắn của AI
        ChatMessage aiMessage = ChatMessage.builder()
                .messRole(MessageRole.ai)
                .messContent(aiResponseText)
                .messCreatedAt(LocalDateTime.now())
                .chatSession(session)
                .build();
        aiMessage = chatMessageRepository.save(aiMessage);

        return ChatMessageDto.builder()
                .messId(aiMessage.getMessId())
                .role(aiMessage.getMessRole())
                .content(aiMessage.getMessContent())
                .createdAt(aiMessage.getMessCreatedAt())
                .build();
    }

    private ChatSessionDto mapToDto(ChatSession session) {
        List<ChatMessageDto> messageDtos = session.getMessages() != null 
                ? session.getMessages().stream()
                    .map(m -> ChatMessageDto.builder()
                        .messId(m.getMessId())
                        .role(m.getMessRole())
                        .content(m.getMessContent())
                        .createdAt(m.getMessCreatedAt())
                        .build())
                    .collect(Collectors.toList())
                : new ArrayList<>();
        long aiCallsInSession = messageDtos.stream()
        .filter(m -> m.getRole() == MessageRole.ai) // Đổi thành role AI của bạn
        .count();

        return ChatSessionDto.builder()
                .sessionId(session.getSessionId())
                .sessionTitle(session.getSessionTitle())
                .documentId(session.getDocument() != null ? session.getDocument().getDocId() : null)
                .createdAt(session.getSessionCreatedAt())
                .messages(messageDtos)
                .build();
    }

    public List<ChatSessionDto> getAllSessionsForAdmin() {
    List<ChatSession> sessions = chatSessionRepository.findAllSessionsForAdmin();
    
    return sessions.stream().map(session -> {
        // 1. Sử dụng hàm mapToDto có sẵn của bạn
        ChatSessionDto dto = mapToDto(session);
        
        // 2. Map chuẩn theo kiểu dữ liệu MessageRole của ChatMessageDto
        if (session.getMessages() != null) {
            List<ChatMessageDto> messageDtos = session.getMessages().stream()
                .map(msg -> ChatMessageDto.builder()
                    .messId(msg.getMessId())
                    .role(msg.getMessRole()) // ✨ TRUYỀN THẲNG ENUM VÀO ĐÂY, không biến đổi thành String nữa để hết lỗi ép kiểu!
                    .content(msg.getMessContent())
                    .createdAt(msg.getMessCreatedAt())
                    .build())
                .toList();
            
            dto.setMessages(messageDtos);
        }
        
        if (session.getAccount() != null) {
            dto.setSessionTitle(session.getSessionTitle() + " (User: " + session.getAccount().getAccountID() + ")");
        }
        
        return dto;
    }).collect(Collectors.toList());
}

    // Xóa phiên chat theo yêu cầu của Admin (Chuyển Long sang Integer để khớp với Repository của bạn)
    @Transactional
    public void deleteSessionByAdmin(Integer sessionId) {
        if (!chatSessionRepository.existsById(sessionId)) {
            throw new RuntimeException("Không tìm thấy phiên chat mang ID: " + sessionId);
        }
        chatSessionRepository.deleteById(sessionId);
    }
}
