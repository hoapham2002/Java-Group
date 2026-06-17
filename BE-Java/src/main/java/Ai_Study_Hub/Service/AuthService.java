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
        // Validate
        if (accountRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email đã được sử dụng.");
        }

        // Auto-generate accountName: 10000000 + số lượng tài khoản hiện tại + 1
        long count = accountRepository.count();
        String accountName = String.valueOf(10000000 + count + 1);

        // Build Account
        Account account = Account.builder()
                .accountName(accountName)
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(UserRole.user)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        // Lưu Account trước để tạo ID trong database
        account = accountRepository.save(account);

        // Build UserProfile (liên kết 1-1)
        UserProfile profile = UserProfile.builder()
                .firstName("")
                .lastName("")
                .account(account)
                .build();

        // Lưu profile tường minh thông qua Repository thay vì phụ thuộc cascade
        userProfileRepository.save(profile);

        log.info("Registered new account: {} ({})", accountName, request.getEmail());

        String token = jwtUtil.generateToken(accountName);

        return AuthResponse.builder()
                .token(token)
                .accountName(accountName)
                .email(account.getEmail())
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
                .accountName(account.getAccountName())
                .email(account.getEmail())
                .role(account.getRole().name())
                .build();
    }
}
