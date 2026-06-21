package Ai_Study_Hub.Domain.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileDTO {
    private Integer accountID;
    private String accountName;
    private String email;
    private String firstName;
    private String lastName;
    private Long storageQuota;
    private long usedStorage;
    private Integer apiCallCount;
}