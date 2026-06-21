package Ai_Study_Hub.Domain.dto;

import Ai_Study_Hub.Domain.enums.DocumentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentDto {
    private Integer docId;
    private String docOriginalName;
    private String docStorageUrl;
    private Long docFileSize;
    private DocumentStatus docStatus;
    private LocalDateTime docUploadedAt;
    private SubjectDto subject;
}
