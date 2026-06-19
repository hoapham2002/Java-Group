package Ai_Study_Hub.Service;

import Ai_Study_Hub.Domain.Account;
import Ai_Study_Hub.Domain.Document;
import Ai_Study_Hub.Domain.DocumentShare;
import Ai_Study_Hub.Domain.dto.DocumentDto;
import Ai_Study_Hub.Domain.dto.ShareDocumentRequest;
import Ai_Study_Hub.Domain.dto.SubjectDto;
import Ai_Study_Hub.Repository.AccountRepository;
import Ai_Study_Hub.Repository.DocumentRepository;
import Ai_Study_Hub.Repository.DocumentShareRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DocumentShareService {

    private final DocumentShareRepository documentShareRepository;
    private final DocumentRepository documentRepository;
    private final AccountRepository accountRepository;

    @Transactional
    public String shareDocument(ShareDocumentRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = auth.getName();
        
        Account currentAccount = accountRepository.findByAccountName(currentUsername)
                .orElseThrow(() -> new RuntimeException("Current account not found"));

        Document document = documentRepository.findById(request.getDocId())
                .orElseThrow(() -> new IllegalArgumentException("Document not found"));

        if (document.getIsDelete()) {
            throw new IllegalArgumentException("Document has been deleted");
        }

        if (document.getAccount().getAccountID() != currentAccount.getAccountID()) {
            throw new IllegalArgumentException("You don't have permission to share this document");
        }

        Account sharedAccount = accountRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Account with this email does not exist"));

        if (sharedAccount.getAccountID() == currentAccount.getAccountID()) {
            throw new IllegalArgumentException("You cannot share document with yourself");
        }

        boolean alreadyShared = documentShareRepository
                .existsByDocument_DocIdAndSharedAccount_AccountIDAndIsActiveTrueAndExpiresAtAfter(
                        document.getDocId(), sharedAccount.getAccountID(), LocalDateTime.now());

        if (alreadyShared) {
            throw new IllegalArgumentException("This document is already shared with this user");
        }

        DocumentShare documentShare = DocumentShare.builder()
                .shareToken(UUID.randomUUID().toString()) // Using UUID as token
                .expiresAt(LocalDateTime.now().plusYears(100)) // 100 years from now (forever)
                .isActive(true)
                .createdAt(LocalDateTime.now())
                .sharedAccount(sharedAccount)
                .createdBy(currentAccount)
                .document(document)
                .build();

        documentShareRepository.save(documentShare);
        log.info("Document {} shared with {} successfully by {}", document.getDocId(), sharedAccount.getEmail(), currentUsername);

        return "Document shared successfully";
    }

    public List<DocumentDto> getSharedDocuments() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = auth.getName();
        
        Account currentAccount = accountRepository.findByAccountName(currentUsername)
                .orElseThrow(() -> new RuntimeException("Current account not found"));

        List<DocumentShare> shares = documentShareRepository
                .findBySharedAccount_AccountIDAndIsActiveTrueAndExpiresAtAfter(currentAccount.getAccountID(), LocalDateTime.now());

        return shares.stream()
                .map(DocumentShare::getDocument)
                .filter(doc -> !doc.getIsDelete())
                .map(doc -> DocumentDto.builder()
                        .docId(doc.getDocId())
                        .docOriginalName(doc.getDocOriginalName())
                        .docStorageUrl(doc.getDocStorageUrl())
                        .docFileSize(doc.getDocFileSize())
                        .docStatus(doc.getDocStatus())
                        .docUploadedAt(doc.getDocUploadedAt())
                        .subject(SubjectDto.builder()
                                .subjId(doc.getSubject().getSubjId())
                                .subjName(doc.getSubject().getSubjName())
                                .subjCode(doc.getSubject().getSubjCode())
                                .build())
                        .build())
                .collect(Collectors.toList());
    }
}
