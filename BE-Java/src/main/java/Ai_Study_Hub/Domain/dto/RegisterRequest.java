package Ai_Study_Hub.Domain.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String accountName;
    private String email;
    private String password;
    private String lastName;
    private String firstName;
}
