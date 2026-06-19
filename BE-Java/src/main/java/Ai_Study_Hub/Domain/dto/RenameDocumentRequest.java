package Ai_Study_Hub.Domain.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RenameDocumentRequest {
    @NotBlank(message = "New name is required")
    private String newName;
}
