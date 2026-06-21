package Ai_Study_Hub.Domain.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthResponse {
    private String token;
    private Integer accountID;
    private String accountName;
    private String email;
    private String role;
    private String lastName;
    private String firstName;
}
