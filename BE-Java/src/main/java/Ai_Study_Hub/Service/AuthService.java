package Ai_Study_Hub.Service;

import Ai_Study_Hub.Domain.Account;
import Ai_Study_Hub.Domain.UserProfile;
import Ai_Study_Hub.Domain.dto.AuthResponse;
import Ai_Study_Hub.Domain.dto.LoginRequest;
import Ai_Study_Hub.Domain.dto.RegisterRequest;
import Ai_Study_Hub.Domain.enums.UserRole;
import Ai_Study_Hub.Repository.AccountRepository;
import Ai_Study_Hub.Repository.UserProfileRepository;
import Ai_Study_Hub.Util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final AccountRepository accountRepository;
    private final UserProfileRepository userProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    /**
     * Đăng ký tài khoản mới.
     * User ID (accountName) được tạo tự động theo dạng: 10000000 + (count + 1).
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Validate Email
        if (accountRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email đã được sử dụng.");
        }

        // Validate Họ và Tên
        String firstName = request.getFirstName();
        String lastName = request.getLastName();
        if (firstName == null || firstName.trim().isEmpty()) {
            throw new IllegalArgumentException("Tên không được để trống.");
        }
        if (lastName == null || lastName.trim().isEmpty()) {
            throw new IllegalArgumentException("Họ không được để trống.");
        }

        // Validate accountName
        String accountName = request.getAccountName();
        if (accountName == null || accountName.trim().isEmpty()) {
            throw new IllegalArgumentException("Tên tài khoản không được để trống.");
        }
        if (accountRepository.existsByAccountName(accountName)) {
            throw new IllegalArgumentException("Tên tài khoản đã tồn tại.");
        }

        // Build Account
        Account account = Account.builder()
                .accountName(accountName.trim())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(UserRole.user)
                .firstName(firstName.trim())
                .lastName(lastName.trim())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        // Lưu Account trước để tạo ID trong database
        account = accountRepository.save(account);

        // Build UserProfile (liên kết 1-1)
        UserProfile profile = UserProfile.builder()
                .firstName(firstName.trim())
                .lastName(lastName.trim())
                .account(account)
                .build();

        // Lưu profile tường minh thông qua Repository thay vì phụ thuộc cascade
        userProfileRepository.save(profile);

        log.info("Registered new account: {} ({})", accountName, request.getEmail());

        String token = jwtUtil.generateToken(accountName);

        return AuthResponse.builder()
                .token(token)
                .accountID(account.getAccountID())
                .accountName(accountName)
                .email(account.getEmail())
                .firstName(profile.getFirstName())
                .lastName(profile.getLastName())
                .role(account.getRole().name())
                .build();
    }

    /**
     * Đăng nhập bằng user_id (accountName) và password.
     */
    public AuthResponse login(LoginRequest request) {
        // Spring Security authenticate (ném exception nếu sai)
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getAccountName(), request.getPassword())
        );

        Account account = accountRepository.findByAccountName(request.getAccountName())
                .orElseThrow(() -> new IllegalArgumentException("Tài khoản không tồn tại."));

        String token = jwtUtil.generateToken(account.getAccountName());

        log.info("User '{}' logged in successfully.", account.getAccountName());

        return AuthResponse.builder()
                .token(token)
                .accountID(account.getAccountID())
                .accountName(account.getAccountName())
                .email(account.getEmail())
                .firstName(account.getFirstName())
                .lastName(account.getLastName())
                .role(account.getRole().name())
                .build();
    }
}
