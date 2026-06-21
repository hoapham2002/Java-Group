package Ai_Study_Hub.Domain.dto;

import Ai_Study_Hub.Domain.enums.MessageRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageDto {
    private Long messId;
    private MessageRole role;
    private String content;
    private LocalDateTime createdAt;
}
