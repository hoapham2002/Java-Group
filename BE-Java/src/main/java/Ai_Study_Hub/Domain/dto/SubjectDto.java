package Ai_Study_Hub.Domain.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubjectDto {
    private Integer subjId;
    private String subjName;
    private String subjCode;
    private LocalDateTime subjCreatedAt;
}
