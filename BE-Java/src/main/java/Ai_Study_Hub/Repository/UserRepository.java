package Ai_Study_Hub.Repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import Ai_Study_Hub.Domain.Account;

@Repository
public interface UserRepository extends JpaRepository<Account, Integer> {
    boolean existsByEmail(String email);

    Optional<Account> findById(Integer accountID);

    Object findByEmail(String email);
}
