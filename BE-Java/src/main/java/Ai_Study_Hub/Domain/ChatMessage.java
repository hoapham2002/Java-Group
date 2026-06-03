package Ai_Study_Hub.Domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

import Ai_Study_Hub.Domain.Enum.MessageRole;

@Entity
@Table(name = "chat_messages", schema = "rag_core")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "mess_id")
    private Long messId;

    @Enumerated(EnumType.STRING)
    @Column(name = "mess_role", nullable = false, length = 10)
    private MessageRole messRole;

    @Column(name = "mess_content", nullable = false, columnDefinition = "TEXT")
    private String messContent;

    @Column(name = "mess_tokens")
    private Integer messTokens;

    @Column(name = "mess_created_at")
    private LocalDateTime messCreatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mess_session_id", referencedColumnName = "session_id")
    private ChatSession chatSession;
}
