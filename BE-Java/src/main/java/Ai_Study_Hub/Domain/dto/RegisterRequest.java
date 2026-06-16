package Ai_Study_Hub.Domain.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String email;
    private String password;
    // accountName is auto-generated (10000000+), not required from user
}
