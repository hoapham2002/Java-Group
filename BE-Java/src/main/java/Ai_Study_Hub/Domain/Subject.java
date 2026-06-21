package Ai_Study_Hub.Domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "subjects", schema = "rag_core")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Subject {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "subj_id")
    private Integer subjId;

    @Column(name = "subj_name", nullable = false)
    private String subjName;

    @Column(name = "subj_code", length = 50)
    private String subjCode;

    @Column(name = "subj_created_at")
    private LocalDateTime subjCreatedAt;

    @Column(name = "subj_deleted_at")
    private LocalDateTime subjDeletedAt;

    @Column(name = "is_delete")
    @Builder.Default
    private Boolean isDelete = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subj_account_id", referencedColumnName = "account_id")
    private Account account;

    @Column(name = "subj_deleted_by")
    private Integer subjDeletedBy;
}
