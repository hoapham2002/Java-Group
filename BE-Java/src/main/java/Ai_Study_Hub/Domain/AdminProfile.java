package Ai_Study_Hub.Domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "admin_profiles", schema = "auth")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "admin_id")
    private Integer adminId;

    @NotBlank(message = "Tên không được để trống")
    @Size(max = 50, message = "Tên không được vượt quá 50 ký tự")
    @Column(name = "first_name", length = 50)
    private String firstName;

    @NotBlank(message = "Họ không được để trống")
    @Size(max = 50, message = "Họ không được vượt quá 50 ký tự")
    @Column(name = "last_name", length = 50)
    private String lastName;

    @Column(name = "storage_quota", columnDefinition = "bigint default 0")
    private Long storageQuota = 0L;

    @Column(name = "used_storage", columnDefinition = "bigint default 0")
    @Min(value = 0)
    @Max(value = 50)
    private Long usedStorage = 0L;

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", referencedColumnName = "account_id", nullable = false, unique = true)
    private Account account;

}