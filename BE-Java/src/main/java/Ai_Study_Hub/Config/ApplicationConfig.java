package Ai_Study_Hub.Config;

import Ai_Study_Hub.Domain.Account;
import Ai_Study_Hub.Repository.AccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

/**
 * Tách các bean liên quan đến Authentication ra khỏi SecurityConfig
 * để tránh Circular Dependency với JwtAuthFilter.
 *
 * Dependency tree:
 *   JwtAuthFilter → UserDetailsService (ApplicationConfig) ✅
 *   SecurityConfig → JwtAuthFilter ✅
 *   Không còn vòng tròn.
 */
@Configuration
@RequiredArgsConstructor
public class ApplicationConfig {

    private final AccountRepository accountRepository;

    @Bean
    public UserDetailsService userDetailsService() {
        return accountName -> {
            Account account = accountRepository.findByAccountName(accountName)
                    .orElseThrow(() -> new UsernameNotFoundException("Account not found: " + accountName));
            return User.builder()
                    .username(account.getAccountName())
                    .password(account.getPasswordHash())
                    .authorities(new SimpleGrantedAuthority("ROLE_" + account.getRole().name().toUpperCase()))
                    .build();
        };
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationProvider authenticationProvider(UserDetailsService userDetailsService,
                                                         PasswordEncoder passwordEncoder) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder);
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
