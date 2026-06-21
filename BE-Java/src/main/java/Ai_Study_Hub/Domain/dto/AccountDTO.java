package Ai_Study_Hub.Domain.dto;

import Ai_Study_Hub.Domain.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AccountDTO {
    private int accountID;
    private String accountName;
    private String email;
    private String passwordHash;
    private UserRole role;
    private String firstName;
    private String lastName;
}
