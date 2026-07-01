package Ai_Study_Hub.Repository;

import Ai_Study_Hub.Domain.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.repository.query.Param;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    // Tổng số câu trả lời của AI
    @Query("""
        SELECT COUNT(m)
        FROM ChatMessage m
        WHERE m.messRole = Ai_Study_Hub.Domain.enums.MessageRole.ai
    """)
    long countTotalAiCalls();

    // Tổng số câu trả lời AI theo user
    @Query("""
        SELECT COUNT(m)
        FROM ChatMessage m
        JOIN m.chatSession s
        WHERE s.account.accountID = :userId
        AND m.messRole = Ai_Study_Hub.Domain.enums.MessageRole.ai
    """)
    long countAiCallsByUserId(@Param("userId") Integer userId);
}
