package Ai_Study_Hub.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import Ai_Study_Hub.Domain.Account;
import Ai_Study_Hub.Domain.dto.AccountDTO;
import Ai_Study_Hub.Domain.pagination.Meta;
import Ai_Study_Hub.Domain.pagination.ResultPaginationDTO;
import Ai_Study_Hub.Repository.AccountRepository;

@Service
public class AccountService {
    private final AccountRepository accountRepository;

    public AccountService(AccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    public Optional<AccountDTO> getUserByID(Integer accountID) {
        return this.accountRepository.findById(accountID)
                .map(account -> AccountDTO.builder()
                        .accountID(account.getAccountID())
                        .accountName(account.getAccountName())
                        .email(account.getEmail())
                        .role(account.getRole())
                        .build());
    }

    @Transactional(readOnly = true)
    public ResultPaginationDTO handleGetAllUser(Specification<Account> spec, Pageable pageable) {

        Page<Account> pageAccount;

        if (spec == null) {
            pageAccount = this.accountRepository.findAll(pageable);
        } else {
            pageAccount = this.accountRepository.findAll(spec, pageable);
        }

        List<AccountDTO> listDTO = pageAccount.getContent().stream()
                .map(account -> AccountDTO.builder()
                        .accountID(account.getAccountID())
                        .accountName(account.getAccountName())
                        .email(account.getEmail())
                        .role(account.getRole())
                        .build())
                .collect(Collectors.toList());

        Meta mt = new Meta();
        mt.setPage(pageAccount.getNumber() + 1);
        mt.setPageSize(pageAccount.getSize());
        mt.setPages(pageAccount.getTotalPages());
        mt.setTotal(pageAccount.getTotalElements());
        ResultPaginationDTO res = new ResultPaginationDTO();
        res.setMeta(mt);
        res.setResult(listDTO);

        return res;
    }

    public boolean handleDeleteUser(Integer accountID) {
        if (this.accountRepository.existsById(accountID)) {
            this.accountRepository.deleteById(accountID);
            return true;
        }
        return false;
    }

    public ResultPaginationDTO searchByAccountName(String accountName, Pageable pageable) {
        Page<Account> pageAccount = accountRepository.findByAccountNameContainingIgnoreCase(accountName, pageable);

        // 2. Map danh sách Entity sang danh sách AccountDTO theo chuẩn của bạn
        List<AccountDTO> listDTO = pageAccount.getContent().stream().map(account -> {
            AccountDTO dto = new AccountDTO();
            dto.setAccountID(account.getAccountID());
            dto.setAccountName(account.getAccountName());
            dto.setEmail(account.getEmail());
            dto.setRole(account.getRole()); //
            return dto;
        }).collect(Collectors.toList());

        ResultPaginationDTO result = new ResultPaginationDTO();
        Meta meta = new Meta();
        meta.setPage(pageAccount.getNumber() + 1);
        meta.setPageSize(pageAccount.getSize());
        meta.setPages(pageAccount.getTotalPages());
        meta.setTotal(pageAccount.getTotalElements());
        result.setMeta(meta);
        result.setResult(listDTO);

        return result;
    }
}
