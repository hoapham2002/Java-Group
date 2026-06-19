package Ai_Study_Hub.Repository;

import Ai_Study_Hub.Domain.DocumentShare;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentShareRepository extends JpaRepository<DocumentShare, Integer> {
    
    boolean existsByDocument_DocIdAndSharedAccount_AccountIDAndIsActiveTrueAndExpiresAtAfter(
            Integer docId, Integer accountId, LocalDateTime currentTime);

    List<DocumentShare> findBySharedAccount_AccountIDAndIsActiveTrueAndExpiresAtAfter(
            Integer accountId, LocalDateTime currentTime);

    Optional<DocumentShare> findByDocument_DocIdAndSharedAccount_AccountIDAndIsActiveTrueAndExpiresAtAfter(
            Integer docId, Integer accountId, LocalDateTime currentTime);
}
