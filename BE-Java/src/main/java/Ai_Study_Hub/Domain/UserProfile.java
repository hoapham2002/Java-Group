package Ai_Study_Hub.Domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "user_profiles", schema = "auth")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Integer userId;

    @NotBlank(message = "Tên không được để trống")
    @Size(max = 50, message = "Tên không được vượt quá 50 ký tự")
    @Column(name = "first_name", length = 50)
    private String firstName;

    @NotBlank(message = "Họ không được để trống")
    @Size(max = 50, message = "Họ không được vượt quá 50 ký tự")
    @Column(name = "last_name", length = 50)
    private String lastName;

    @Column(name = "storage_quota", columnDefinition = "bigint default 104857600")
    @Builder.Default
    private Long storageQuota = 104857600L;

    @Column(name = "used_storage", columnDefinition = "bigint default 0")
    @Min(value = 0)
    @Max(value = 50)
    @Builder.Default
    private Long usedStorage = 0L;

    @Column(name = "api_call_count", columnDefinition = "integer default 0")
    @Builder.Default
    private Integer apiCallCount = 0;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", referencedColumnName = "account_id", nullable = false, unique = true)
    private Account account;
}
