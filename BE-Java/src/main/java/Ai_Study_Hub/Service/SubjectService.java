package Ai_Study_Hub.Service;

import Ai_Study_Hub.Domain.Subject;
import Ai_Study_Hub.Domain.dto.SubjectDto;
import Ai_Study_Hub.Repository.SubjectRepository;
import Ai_Study_Hub.Domain.Account;
import Ai_Study_Hub.Domain.Document;
import Ai_Study_Hub.Repository.AccountRepository;
import Ai_Study_Hub.Repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SubjectService {

    private final SubjectRepository subjectRepository;
    private final AccountRepository accountRepository;
    private final DocumentRepository documentRepository;

    public List<SubjectDto> getAllSubjects() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String accountName = auth.getName();
        Account account = accountRepository.findByAccountName(accountName)
                .orElseThrow(() -> new RuntimeException("Current account not found"));

        List<Subject> subjects = subjectRepository.findAll();
        return subjects.stream()
                .filter(subject -> !subject.getIsDelete() && subject.getAccount() != null && subject.getAccount().getAccountID() == account.getAccountID())
                .map(subject -> SubjectDto.builder()
                        .subjId(subject.getSubjId())
                        .subjName(subject.getSubjName())
                        .subjCode(subject.getSubjCode())
                        .subjCreatedAt(subject.getSubjCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public SubjectDto createSubject(String name) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Account account = accountRepository.findByAccountName(auth.getName())
                .orElseThrow(() -> new RuntimeException("Current account not found"));

        Subject subject = Subject.builder()
                .subjName(name)
                .subjCreatedAt(LocalDateTime.now())
                .isDelete(false)
                .account(account)
                .build();
        
        subject = subjectRepository.save(subject);
        log.info("Created new subject ID: {} by {}", subject.getSubjId(), auth.getName());

        return SubjectDto.builder()
                .subjId(subject.getSubjId())
                .subjName(subject.getSubjName())
                .subjCreatedAt(subject.getSubjCreatedAt())
                .build();
    }

    @Transactional
    public SubjectDto renameSubject(Integer subjId, String newName) {
        Subject subject = subjectRepository.findById(subjId)
                .orElseThrow(() -> new IllegalArgumentException("Subject not found"));
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (subject.getAccount() == null || !subject.getAccount().getAccountName().equals(auth.getName())) {
            throw new IllegalArgumentException("You don't have permission to rename this subject");
        }
        
        if (subject.getIsDelete()) {
            throw new IllegalArgumentException("Subject has been deleted");
        }

        subject.setSubjName(newName);
        subject = subjectRepository.save(subject);
        log.info("Renamed subject ID: {} to {}", subjId, newName);

        return SubjectDto.builder()
                .subjId(subject.getSubjId())
                .subjName(subject.getSubjName())
                .subjCreatedAt(subject.getSubjCreatedAt())
                .build();
    }

    @Transactional
    public void deleteSubject(Integer subjId) {
        Subject subject = subjectRepository.findById(subjId)
                .orElseThrow(() -> new IllegalArgumentException("Subject not found"));
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (subject.getAccount() == null || !subject.getAccount().getAccountName().equals(auth.getName())) {
            throw new IllegalArgumentException("You don't have permission to delete this subject");
        }

        subject.setIsDelete(true);
        subject.setSubjDeletedAt(LocalDateTime.now());
        subjectRepository.save(subject);
        
        // Soft delete all documents in this subject
        List<Document> docs = documentRepository.findBySubject_SubjId(subjId);
        for (Document doc : docs) {
            if (!doc.getIsDelete()) {
                doc.setIsDelete(true);
                doc.setDocDeletedAt(LocalDateTime.now());
                documentRepository.save(doc);
            }
        }
        log.info("Deleted subject ID: {} and soft deleted {} documents", subjId, docs.size());
    }
}
