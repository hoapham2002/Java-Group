package Ai_Study_Hub.Repository;

import Ai_Study_Hub.Domain.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Integer> {
    List<Document> findBySubject_SubjId(Integer subjId);
}
