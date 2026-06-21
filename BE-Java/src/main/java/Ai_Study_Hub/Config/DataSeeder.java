package Ai_Study_Hub.Config;

import Ai_Study_Hub.Domain.Account;
import Ai_Study_Hub.Domain.Subject;
import Ai_Study_Hub.Domain.enums.UserRole;
import Ai_Study_Hub.Repository.AccountRepository;
import Ai_Study_Hub.Repository.SubjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final AccountRepository accountRepository;
    private final SubjectRepository subjectRepository;

    @Override
    public void run(String... args) throws Exception {
        if (accountRepository.count() == 0) {
            Account user = new Account();
            user.setAccountName("Test User");
            user.setFirstName("Test");
            user.setLastName("User");
            user.setEmail("user@example.com");
            user.setPasswordHash("hashed_password_mock");
            user.setRole(UserRole.user);
            user.setCreatedAt(LocalDateTime.now());
            user.setUpdatedAt(LocalDateTime.now());
            user.setIsDeleted(false);
            accountRepository.save(user);
            log.info("Seeded 1 mock Account (id: {})", user.getAccountID());
        }

        if (subjectRepository.count() == 0) {
            Subject subject = new Subject();
            subject.setSubjName("Artificial Intelligence");
            subject.setSubjCode("AI101");
            subjectRepository.save(subject);
            log.info("Seeded 1 mock Subject (id: {})", subject.getSubjId());
        }
    }
}
