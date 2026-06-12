package Ai_Study_Hub.Controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import Ai_Study_Hub.Domain.Account;
import Ai_Study_Hub.Domain.LoginDTO;
import Ai_Study_Hub.Domain.RegisterDTO;
import Ai_Study_Hub.Repository.UserRepository;
import Ai_Study_Hub.Util.SecurityUtil;
import jakarta.validation.Valid;

@CrossOrigin(origins = "*")
@RequestMapping("/auth")
@RestController
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final SecurityUtil securityUtil;

    public AuthController(SecurityUtil securityUtil, PasswordEncoder passwordEncoder, UserRepository userRepository) {
        this.passwordEncoder = passwordEncoder;
        this.securityUtil = securityUtil;
        this.userRepository = userRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@Valid @RequestBody LoginDTO loginDTO) {
        Object fetched = this.userRepository.findByEmail(loginDTO.getEmail());
        final Account account;
        if (fetched instanceof java.util.Optional) {
            account = ((java.util.Optional<Account>) fetched)
                    .orElseThrow(() -> new RuntimeException("Email hoặc mật khẩu không chính xác!"));
        } else {
            account = (Account) fetched;
            if (account == null) {
                throw new RuntimeException("Email hoặc mật khẩu không chính xác!");
            }
        }
        if (!passwordEncoder.matches(loginDTO.getPassword(), account.getPasswordHash())) {
            throw new RuntimeException("Email hoặc mật khẩu không chính xác!");
        }
        String accessToken = this.securityUtil.createAccessToken(account.getEmail());
        Map<String, String> response = new HashMap<>();
        response.put("token", accessToken);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@Valid @RequestBody RegisterDTO registerDTO) {
        // 1. Kiểm tra xem email đã được đăng ký chưa
        Object fetched = this.userRepository.findByEmail(registerDTO.getEmail());
        if (fetched instanceof java.util.Optional) {
            if (((java.util.Optional<Account>) fetched).isPresent()) {
                throw new RuntimeException("Email này đã được sử dụng trong hệ thống!");
            }
        } else if (fetched != null) {
            throw new RuntimeException("Email này đã được sử dụng trong hệ thống!");
        }

        Account newAccount = new Account();
        newAccount.setAccountName(registerDTO.getUserName());
        newAccount.setEmail(registerDTO.getEmail());
        newAccount.setFirstName(registerDTO.getFirstName());
        newAccount.setLastName(registerDTO.getLastName());
        String hashPassword = this.passwordEncoder.encode(registerDTO.getPassword());
        newAccount.setPasswordHash(hashPassword);

        // 4. Lưu vào Database
        this.userRepository.save(newAccount);

        // 5. Trả về cấu trúc JSON thông báo thành công cho Front-End nhận diện
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Đăng ký tài khoản thành công!");

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
