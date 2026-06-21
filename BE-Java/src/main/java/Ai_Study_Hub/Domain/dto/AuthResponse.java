package Ai_Study_Hub.Domain.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String accountName;
    private String email;
    private Integer accountID;
    private String role;
    private String lastName;
    private String firstName;
}
