package Ai_Study_Hub.Service;

import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import Ai_Study_Hub.Domain.Account;
import Ai_Study_Hub.Repository.UserRepository;
import jakarta.validation.Valid;

@Service
public class UserService {
    private final UserRepository userRepository;
    private PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Account handleCreateUser(Account ac) {
        if (userRepository.existsByEmail(ac.getEmail())) {
            throw new RuntimeException("Email này đã được sử dụng trên hệ thống!");
        }
        String passwordEncode = this.passwordEncoder.encode(ac.getPasswordHash());
        ac.setPasswordHash(passwordEncode);
        return this.userRepository.save(ac);
    }

    public Account handleGetUserById(Integer id) {
        Optional<Account> userOptional = this.userRepository.findById(id);
        if (userOptional != null) {
            return userOptional.get();
        }
        return null;
    }

    public Account handleUpdateAccount(Account ac) {
        Account nac = this.handleGetUserById(ac.getAccountID());
        if (nac != null) {
            nac.setAccountName(ac.getAccountName());
            nac.setEmail(ac.getEmail());
            nac.setPasswordHash(ac.getPasswordHash());
        }
        nac = this.userRepository.save(nac);
        return nac;
    }

    public void handleDeleteUserByid(Integer id) {
        this.userRepository.deleteById(id);
    }
}
