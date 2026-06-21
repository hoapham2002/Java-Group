package Ai_Study_Hub.Repository;

import Ai_Study_Hub.Domain.ChatSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ChatSessionRepository extends JpaRepository<ChatSession, Integer> {
    Optional<ChatSession> findTopByDocument_DocIdAndAccount_AccountIDOrderBySessionCreatedAtDesc(Integer docId, Integer accountId);
}
