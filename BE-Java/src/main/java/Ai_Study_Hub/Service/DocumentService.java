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
import Ai_Study_Hub.Repository.SubjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
        // Hardcode Account ID = 1 for now as per plan
        Account account = accountRepository.findById(1)
                .orElseThrow(() -> new RuntimeException("Default account not found"));
                
        Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new IllegalArgumentException("Subject not found"));

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

    public List<DocumentDto> getAllDocuments() {
        // Here we could filter by account ID (e.g., accountId = 1) and isDelete = false
        List<Document> documents = documentRepository.findAll()
                .stream()
                .filter(doc -> !doc.getIsDelete())
                .collect(Collectors.toList());

        return documents.stream().map(doc -> DocumentDto.builder()
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
                .build()).collect(Collectors.toList());
    }

    @Transactional
    public void deleteDocument(Integer docId) {
        Document document = documentRepository.findById(docId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found"));
        
        document.setIsDelete(true);
        document.setDocDeletedAt(LocalDateTime.now());
        documentRepository.save(document);
        log.info("Soft deleted document ID: {}", docId);
    }

    public String getDocumentViewUrl(Integer docId) throws Exception {
        Document document = documentRepository.findById(docId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found"));
        
        if (document.getIsDelete()) {
            throw new IllegalArgumentException("Document has been deleted");
        }

        // URL lưu trong DB là dạng "bucket_name/object_name"
        String storageUrl = document.getDocStorageUrl();
        String objectName = storageUrl;
        if (storageUrl.contains("/")) {
            objectName = storageUrl.substring(storageUrl.indexOf("/") + 1);
        }

        return minioService.getPresignedUrl(objectName);
    }
}
