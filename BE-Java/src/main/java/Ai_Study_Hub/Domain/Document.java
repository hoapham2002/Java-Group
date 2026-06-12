package Ai_Study_Hub.Domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

import Ai_Study_Hub.Domain.Enum.DocumentStatus;

@Entity
@Table(name = "documents", schema = "rag_core")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Document {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "doc_id")
    private Integer docId;

    @Column(name = "doc_original_name", nullable = false)
    private String docOriginalName;

    @Column(name = "doc_storage_url", nullable = false, length = 500)
    private String docStorageUrl;

    @Column(name = "doc_file_size", nullable = false)
    private Long docFileSize;

    @Enumerated(EnumType.STRING)
    @Column(name = "doc_status", length = 20)
    private DocumentStatus docStatus;

    @Column(name = "doc_uploaded_at")
    private LocalDateTime docUploadedAt;

    @Column(name = "doc_deleted_at")
    private LocalDateTime docDeletedAt;

    @Column(name = "is_delete")
    private Boolean isDelete = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doc_account_id", referencedColumnName = "account_id")
    private Account account;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doc_subject_id", referencedColumnName = "subj_id")
    private Subject subject;

    @Column(name = "doc_deleted_by")
    private Integer docDeletedBy;

    // Quan hệ 1-N với DocumentChunk
    @OneToMany(mappedBy = "document", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DocumentChunk> chunks;

}