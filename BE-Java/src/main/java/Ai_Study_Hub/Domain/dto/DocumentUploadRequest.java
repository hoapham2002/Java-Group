package Ai_Study_Hub.Domain.dto;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class DocumentUploadRequest {
    private MultipartFile file;
    private Integer subjectId;
}
