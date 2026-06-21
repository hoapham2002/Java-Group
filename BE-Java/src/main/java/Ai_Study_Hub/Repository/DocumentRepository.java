package Ai_Study_Hub.Repository;

import Ai_Study_Hub.Domain.Account;
import Ai_Study_Hub.Domain.Document;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Integer> {
    List<Document> findBySubject_SubjId(Integer subjId);
    
    List<Document> findByAccount_AccountID(Integer accountID);

    List<Document> findByAccountAndIsDeleteFalse(Account account);
}
