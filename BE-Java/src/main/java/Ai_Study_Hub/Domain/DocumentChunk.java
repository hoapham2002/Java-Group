package Ai_Study_Hub.Domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "document_chunks", schema = "rag_core")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentChunk {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "chunk_id")
    private Long chunkId; // BIGSERIAL -> Long

    @Column(name = "chunk_index", nullable = false)
    private Integer chunkIndex;

    @Column(name = "chunk_content", nullable = false, columnDefinition = "TEXT")
    private String chunkContent;

    // Lưu ý: Cần hibernate-vector (nếu dùng Hibernate 6+) hoặc custom type để map
    // kiểu VECTOR của pgvector.
    // Dưới đây là cách map chuẩn nhất nếu dùng dependency com.pgvector:pgvector
    @Column(name = "chunk_embedding", columnDefinition = "vector(384)")
    private float[] chunkEmbedding;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chunk_document_id", referencedColumnName = "doc_id")
    private Document document;
}
