package Ai_Study_Hub.Repository;

import Ai_Study_Hub.Domain.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, Integer> {
    Optional<Account> findByEmail(String email);
    Optional<Account> findByAccountName(String accountName);
    boolean existsByEmail(String email);
    boolean existsByAccountName(String accountName);
}
