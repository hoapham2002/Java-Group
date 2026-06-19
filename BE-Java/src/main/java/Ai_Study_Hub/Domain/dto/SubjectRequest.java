package Ai_Study_Hub.Domain.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SubjectRequest {
    @NotBlank(message = "Subject name is required")
    private String name;
}
