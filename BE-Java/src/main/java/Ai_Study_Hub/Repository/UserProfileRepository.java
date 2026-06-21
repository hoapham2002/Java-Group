package Ai_Study_Hub.Repository;

import Ai_Study_Hub.Domain.UserProfile;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserProfileRepository extends JpaRepository<UserProfile, Integer> {
    Optional<UserProfile> findByAccount_AccountID(Integer accountID);
}
