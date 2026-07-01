package Ai_Study_Hub.Repository;

import Ai_Study_Hub.Domain.ChatSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;
import java.util.List;

@Repository
public interface ChatSessionRepository extends JpaRepository<ChatSession, Integer> {
    
    Optional<ChatSession> findTopByDocument_DocIdAndAccount_AccountIDOrderBySessionCreatedAtDesc(Integer docId, Integer accountId);

    // GỘP CHUNG: Tải toàn bộ Account, Document và danh sách Messages trong 1 câu Query duy nhất
    @Query("SELECT DISTINCT s FROM ChatSession s " +
           "LEFT JOIN FETCH s.account " +
           "LEFT JOIN FETCH s.document " +
           "LEFT JOIN FETCH s.messages " + 
           "ORDER BY s.sessionCreatedAt DESC")
    List<ChatSession> findAllSessionsForAdmin();
}