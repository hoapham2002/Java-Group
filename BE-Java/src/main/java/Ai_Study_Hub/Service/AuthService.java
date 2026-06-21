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

        public AuthResponse register(RegisterRequest request) {
                // 1. Validate Email
                if (accountRepository.existsByEmail(request.getEmail())) {
                        throw new IllegalArgumentException("Email đã được sử dụng.");
                }

                // 2. Validate AccountName
                String accountName = request.getAccountName();
                if (accountName == null || accountName.trim().isEmpty()) {
                        throw new IllegalArgumentException("Tên tài khoản không được để trống.");
                }
                if (accountRepository.existsByAccountName(accountName)) {
                        throw new IllegalArgumentException("Tên tài khoản này đã tồn tại, vui lòng chọn tên khác.");
                }

                // 3. Validate Họ và Tên
                String firstName = request.getFirstName();
                String lastName = request.getLastName();
                if (firstName == null || firstName.trim().isEmpty()) {
                        throw new IllegalArgumentException("Tên không được để trống.");
                }
                if (lastName == null || lastName.trim().isEmpty()) {
                        throw new IllegalArgumentException("Họ không được để trống.");
                }

                // 4. Build & Lưu Account
                Account account = Account.builder()
                                .accountName(accountName)
                                .email(request.getEmail())
                                .passwordHash(passwordEncoder.encode(request.getPassword()))
                                .role(UserRole.user)
                                .firstName(firstName.trim()) // Thêm dòng này để qua bộ lọc @NotNull của Account
                                .lastName(lastName.trim()) // Thêm dòng này để qua bộ lọc @NotNull của Account
                                .createdAt(LocalDateTime.now())
                                .updatedAt(LocalDateTime.now())
                                .build();

                account = accountRepository.save(account);

                // 5. Build & Lưu UserProfile (Giữ nguyên)
                UserProfile profile = UserProfile.builder()
                                .firstName(firstName.trim())
                                .lastName(lastName.trim())
                                .account(account)
                                .build();

                userProfileRepository.save(profile);

                log.info("Registered new account: {} ({})", accountName, request.getEmail());

                String token = jwtUtil.generateToken(accountName);

                // 6. Trả về AuthResponse
                return AuthResponse.builder()
                                .token(token)
                                .accountName(accountName)
                                .email(account.getEmail())
                                .role(account.getRole().name())
                                .firstName(profile.getFirstName())
                                .lastName(profile.getLastName())
                                .build();
        }

        /**
         * Đăng nhập bằng user_id (accountName) và password.
         */
        public AuthResponse login(LoginRequest request) {
                // Spring Security authenticate (ném exception nếu sai)
                authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(request.getAccountName(),
                                                request.getPassword()));

                Account account = accountRepository.findByAccountName(request.getAccountName())
                                .orElseThrow(() -> new IllegalArgumentException("Tài khoản không tồn tại."));

                String token = jwtUtil.generateToken(account.getAccountName());

                log.info("User '{}' logged in successfully.", account.getAccountName());

                // Đã thêm accountID, firstName và lastName vào response trả về
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
