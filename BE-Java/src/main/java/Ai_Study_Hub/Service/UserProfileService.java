package Ai_Study_Hub.Service;

import java.util.Optional;

import org.springframework.stereotype.Service;

import Ai_Study_Hub.Domain.Account;
import Ai_Study_Hub.Domain.UserProfile;
import Ai_Study_Hub.Domain.dto.UserProfileDTO;
import Ai_Study_Hub.Repository.AccountRepository;
import Ai_Study_Hub.Repository.UserProfileRepository;

@Service
public class UserProfileService {
    private final UserProfileRepository userProfileRepository;
    private final AccountRepository accountRepository;

    public UserProfileService(UserProfileRepository userProfileRepository, AccountRepository accountRepository) {
        this.userProfileRepository = userProfileRepository;
        this.accountRepository = accountRepository;
    }

    public Optional<UserProfileDTO> getUserProfile(Integer accountID) {
        // 1. Tìm tài khoản trước, nếu không có tài khoản thì nghỉ luôn
        Optional<Account> accountOpt = accountRepository.findById(accountID);
        if (accountOpt.isEmpty()) {
            return Optional.empty();
        }
        Account account = accountOpt.get();

        // 2. Tìm Profile theo accountID
        Optional<UserProfile> profileOpt = userProfileRepository.findByAccount_AccountID(accountID);

        // 3. Build DTO:
        UserProfileDTO.UserProfileDTOBuilder builder = UserProfileDTO.builder()
                .accountID(account.getAccountID())
                .accountName(account.getAccountName())
                .email(account.getEmail());

        if (profileOpt.isPresent()) {
            UserProfile profile = profileOpt.get();
            builder.firstName(profile.getFirstName())
                    .lastName(profile.getLastName())
                    .storageQuota(profile.getStorageQuota())
                    .usedStorage(profile.getUsedStorage())
                    .apiCallCount(profile.getApiCallCount());
        } else {
            builder.accountID(account.getAccountID())
                    .accountName(account.getAccountName())
                    .email(account.getEmail())
                    .firstName(account.getFirstName() != null ? account.getFirstName() : "")
                    .lastName(account.getLastName() != null ? account.getLastName() : "")
                    .storageQuota(104857600L)
                    .usedStorage(0L) // Đã xóa bỏ chữ "usedStorage:" bị thừa
                    .apiCallCount(0); // Đã xóa bỏ chữ "apiCallCount:" bị thừa
        }
        return Optional.of(builder.build());
    }
}
