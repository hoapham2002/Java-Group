package Ai_Study_Hub.Repository;

import Ai_Study_Hub.Domain.Account;
import Ai_Study_Hub.Domain.enums.MessageRole;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, Integer>, JpaSpecificationExecutor<Account> {

    Optional<Account> findByEmail(String email);

    Optional<Account> findByAccountName(String accountName);

    boolean existsByEmail(String email);

    boolean existsByAccountName(String accountName);

    Page<Account> findByAccountNameContainingIgnoreCase(String accountName, Pageable pageable);

    @Query("""
    SELECT COUNT(m)
    FROM ChatMessage m
    WHERE m.chatSession.account.accountID = :accountId
    AND m.messRole = :role
    """)
    Integer countAiCallsByAccountId(
            @Param("accountId") Integer accountId,
            @Param("role") MessageRole role);
    
    @Query("""
    SELECT COALESCE(SUM(d.docFileSize), 0)
    FROM Document d
    WHERE d.account.accountID = :accountId
    """)
    Long sumStorageByAccountId(@Param("accountId") Integer accountId);
}
