package Ai_Study_Hub.Domain.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatSessionDto {
    private Integer sessionId;
    private String sessionTitle;
    private Integer documentId;
    private LocalDateTime createdAt;
    private List<ChatMessageDto> messages;
}
