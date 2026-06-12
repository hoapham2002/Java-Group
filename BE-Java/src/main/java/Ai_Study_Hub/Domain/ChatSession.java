package Ai_Study_Hub.Domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "chat_sessions", schema = "rag_core")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatSession {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "session_id")
    private Integer sessionId;

    @Column(name = "session_title")
    private String sessionTitle;

    @Column(name = "session_created_at")
    private LocalDateTime sessionCreatedAt;

    @Column(name = "session_deleted_at")
    private LocalDateTime sessionDeletedAt;

    @Column(name = "is_delete")
    private Boolean isDelete = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_account_id", referencedColumnName = "account_id")
    private Account account;

    @Column(name = "session_deleted_by")
    private Integer sessionDeletedBy;

    @OneToMany(mappedBy = "chatSession", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ChatMessage> messages;
}