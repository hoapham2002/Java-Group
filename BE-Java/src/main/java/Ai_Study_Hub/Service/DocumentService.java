package Ai_Study_Hub.Service;

import Ai_Study_Hub.Domain.Account;
import Ai_Study_Hub.Domain.Document;
import Ai_Study_Hub.Domain.Subject;
import Ai_Study_Hub.Domain.dto.DocumentUploadRequest;
import Ai_Study_Hub.Domain.dto.RagTaskMessage;
import Ai_Study_Hub.Domain.dto.UploadResponse;
import Ai_Study_Hub.Domain.enums.DocumentStatus;
import Ai_Study_Hub.Domain.dto.DocumentDto;
import Ai_Study_Hub.Domain.dto.SubjectDto;
import Ai_Study_Hub.Repository.AccountRepository;
import Ai_Study_Hub.Repository.DocumentRepository;
import Ai_Study_Hub.Repository.DocumentShareRepository;
import Ai_Study_Hub.Repository.SubjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DocumentService {

    private final MinioService minioService;
    private final RedisProducerService redisProducerService;
    private final DocumentRepository documentRepository;
    private final DocumentShareRepository documentShareRepository;
    private final AccountRepository accountRepository;
    private final SubjectRepository subjectRepository;

    @Transactional
    public UploadResponse uploadDocument(DocumentUploadRequest request) throws Exception {
        // 1. Validate PDF
        if (request.getFile() == null || request.getFile().isEmpty()) {
            throw new IllegalArgumentException("File is required");
        }

        String originalName = request.getFile().getOriginalFilename();
        if (originalName == null || !originalName.toLowerCase().endsWith(".pdf")) {
            throw new IllegalArgumentException("Only PDF files are allowed");
        }

        // 2. Fetch Account and Subject
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String accountName = auth.getName();
        Account account = accountRepository.findByAccountName(accountName)
                .orElseThrow(() -> new RuntimeException("Current account not found"));

        Subject subject = null;
        if (request.getSubjectId() != null) {
            subject = subjectRepository.findById(request.getSubjectId())
                    .orElseThrow(() -> new IllegalArgumentException("Subject not found"));
        }

        // 3. Upload to MinIO
        String minioUrl = minioService.uploadFile(request.getFile());

        // 4. Save Document metadata
        Document document = Document.builder()
                .docOriginalName(originalName)
                .docStorageUrl(minioUrl)
                .docFileSize(request.getFile().getSize())
                .docStatus(DocumentStatus.pending)
                .docUploadedAt(LocalDateTime.now())
                .account(account)
                .subject(subject)
                .build();

        document = documentRepository.save(document);
        log.info("Saved Document metadata to DB with ID: {}", document.getDocId());

        // 5. Push to Redis Stream
        RagTaskMessage msg = RagTaskMessage.builder()
                .docId(document.getDocId())
                .minioUrl(minioUrl)
                .fileName(originalName)
                .build();
        redisProducerService.pushTask(msg);

        return UploadResponse.builder()
                .documentId(document.getDocId())
                .fileName(originalName)
                .message("File uploaded successfully and sent to processing queue")
                .build();
    }

    public List<DocumentDto> getUserDocuments() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String accountName = auth.getName();
        Account account = accountRepository.findByAccountName(accountName)
                .orElseThrow(() -> new RuntimeException("Current account not found"));

        List<Document> documents = documentRepository.findByAccountAndIsDeleteFalse(account);

        return documents.stream().map(doc -> DocumentDto.builder()
                .docId(doc.getDocId())
                .docOriginalName(doc.getDocOriginalName())
                .docStorageUrl(doc.getDocStorageUrl())
                .docFileSize(doc.getDocFileSize())
                .docStatus(doc.getDocStatus())
                .docUploadedAt(doc.getDocUploadedAt())
                .subject(doc.getSubject() != null ? SubjectDto.builder()
                        .subjId(doc.getSubject().getSubjId())
                        .subjName(doc.getSubject().getSubjName())
                        .subjCode(doc.getSubject().getSubjCode())
                        .build() : null)
                .build()).collect(Collectors.toList());
    }

    @Transactional
    public void deleteDocument(Integer docId) {
        Document document = documentRepository.findById(docId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found"));

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (!document.getAccount().getAccountName().equals(auth.getName())) {
            throw new IllegalArgumentException("You don't have permission to delete this document");
        }

        document.setIsDelete(true);
        document.setDocDeletedAt(LocalDateTime.now());
        documentRepository.save(document);
        log.info("Soft deleted document ID: {}", docId);
    }

    public String getDocumentUrl(Integer docId) {
        Document document = documentRepository.findById(docId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found"));

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = auth.getName();
        
        boolean isOwner = document.getAccount().getAccountName().equals(currentUsername);
        
        if (!isOwner) {
            Account currentAccount = accountRepository.findByAccountName(currentUsername)
                    .orElseThrow(() -> new RuntimeException("Current account not found"));
            boolean isShared = documentShareRepository
                    .existsByDocument_DocIdAndSharedAccount_AccountIDAndIsActiveTrueAndExpiresAtAfter(
                            docId, currentAccount.getAccountID(), LocalDateTime.now());
            if (!isShared) {
                throw new IllegalArgumentException("You don't have permission to view this document");
            }
        }

        if (document.getIsDelete()) {
            throw new IllegalArgumentException("Document has been deleted");
        }

        try {
            String storageUrl = document.getDocStorageUrl();
            String objectName = storageUrl;
            if (storageUrl.contains("/")) {
                objectName = storageUrl.substring(storageUrl.indexOf("/") + 1);
            }
            return minioService.getPresignedUrl(objectName);
        } catch (Exception e) {
            log.error("Failed to get document URL", e);
            throw new RuntimeException("Could not retrieve document URL", e);
        }
    }

    @Transactional
    public DocumentDto renameDocument(Integer docId, String newName) {
        Document document = documentRepository.findById(docId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found"));
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (!document.getAccount().getAccountName().equals(auth.getName())) {
            throw new IllegalArgumentException("You don't have permission to rename this document");
        }
        
        if (document.getIsDelete()) {
            throw new IllegalArgumentException("Document has been deleted");
        }

        if (newName == null || newName.trim().isEmpty()) {
            throw new IllegalArgumentException("New name cannot be empty");
        }

        document.setDocOriginalName(newName);
        document = documentRepository.save(document);
        log.info("Renamed document ID: {} to {}", docId, newName);

        return DocumentDto.builder()
                .docId(document.getDocId())
                .docOriginalName(document.getDocOriginalName())
                .docStorageUrl(document.getDocStorageUrl())
                .docFileSize(document.getDocFileSize())
                .docStatus(document.getDocStatus())
                .docUploadedAt(document.getDocUploadedAt())
                .subject(document.getSubject() != null ? SubjectDto.builder()
                        .subjId(document.getSubject().getSubjId())
                        .subjName(document.getSubject().getSubjName())
                        .subjCode(document.getSubject().getSubjCode())
                        .build() : null)
                .build();
    }

    @Transactional
    public DocumentDto moveDocument(Integer docId, Integer newSubjectId) {
        Document document = documentRepository.findById(docId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found"));
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (!document.getAccount().getAccountName().equals(auth.getName())) {
            throw new IllegalArgumentException("You don't have permission to move this document");
        }
        
        if (document.getIsDelete()) {
            throw new IllegalArgumentException("Document has been deleted");
        }

        Subject subject = null;
        if (newSubjectId != null) {
            subject = subjectRepository.findById(newSubjectId)
                    .orElseThrow(() -> new IllegalArgumentException("Subject not found"));
            // Ensure subject belongs to the user
            if (subject.getAccount() == null || !subject.getAccount().getAccountName().equals(auth.getName())) {
                throw new IllegalArgumentException("You don't have permission to move to this subject");
            }
        }

        document.setSubject(subject);
        document = documentRepository.save(document);
        log.info("Moved document ID: {} to subject ID: {}", docId, newSubjectId);

        return DocumentDto.builder()
                .docId(document.getDocId())
                .docOriginalName(document.getDocOriginalName())
                .docStorageUrl(document.getDocStorageUrl())
                .docFileSize(document.getDocFileSize())
                .docStatus(document.getDocStatus())
                .docUploadedAt(document.getDocUploadedAt())
                .subject(document.getSubject() != null ? SubjectDto.builder()
                        .subjId(document.getSubject().getSubjId())
                        .subjName(document.getSubject().getSubjName())
                        .subjCode(document.getSubject().getSubjCode())
                        .build() : null)
                .build();
    }

    public List<DocumentDto> getFilesByAccountId(Integer accountID) {
        List<Document> documents = this.documentRepository.findByAccount_AccountID(accountID);
        return documents.stream().map(doc -> DocumentDto.builder()
                .docId(doc.getDocId())
                .docOriginalName(doc.getDocOriginalName())
                .docStorageUrl(doc.getDocStorageUrl())
                .docFileSize(doc.getDocFileSize())
                .docStatus(doc.getDocStatus())
                .docUploadedAt(doc.getDocUploadedAt())
                .build()).collect(Collectors.toList());
    }

    public List<DocumentDto> getAllDocumentsForAdmin() {
        List<Document> documents = documentRepository.findAll()
                .stream()
                .filter(doc -> doc.getIsDelete() == null || !doc.getIsDelete())
                .collect(Collectors.toList());

        return documents.stream().map(doc -> {
            SubjectDto subjectDto = null;
            if (doc.getSubject() != null) {
                subjectDto = SubjectDto.builder()
                        .subjId(doc.getSubject().getSubjId())
                        .subjName(doc.getSubject().getSubjName())
                        .subjCode(doc.getSubject().getSubjCode())
                        .build();
            }

            return DocumentDto.builder()
                    .docId(doc.getDocId())
                    .docOriginalName(doc.getDocOriginalName())
                    .docStorageUrl(doc.getDocStorageUrl())
                    .docFileSize(doc.getDocFileSize())
                    .docStatus(doc.getDocStatus())
                    .docUploadedAt(doc.getDocUploadedAt())
                    .subject(subjectDto) 
                    .build();
        }).collect(Collectors.toList());
    }
}
