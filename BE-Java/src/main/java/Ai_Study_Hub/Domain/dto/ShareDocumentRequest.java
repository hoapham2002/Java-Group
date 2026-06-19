package Ai_Study_Hub.Domain.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShareDocumentRequest {
    @NotNull(message = "Document ID is required")
    private Integer docId;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;
}
