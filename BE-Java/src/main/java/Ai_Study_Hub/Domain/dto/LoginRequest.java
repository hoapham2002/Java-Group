package Ai_Study_Hub.Domain.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String accountName;  // user_id (e.g. "10000001")
    private String password;
}
