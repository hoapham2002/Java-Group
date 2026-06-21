package Ai_Study_Hub.Controller;

import org.springframework.web.bind.annotation.RestController;

import Ai_Study_Hub.Domain.Account;
import Ai_Study_Hub.Domain.dto.AccountDTO;
import Ai_Study_Hub.Domain.pagination.ResultPaginationDTO;
import Ai_Study_Hub.Service.AccountService;
import Ai_Study_Hub.Util.ApiResponse;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.turkraft.springfilter.boot.Filter;

@RestController
@RequestMapping("/api/v1/account")
public class AcountController {
    private final AccountService accountService;

    public AcountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @GetMapping("/getUser/{id}")
    public ResponseEntity<ApiResponse<AccountDTO>> getUserByID(@PathVariable("id") Integer accountID) {
        Optional<AccountDTO> accountDTO = this.accountService.getUserByID(accountID);

        if (accountDTO.isPresent()) {

            return ResponseEntity.ok(ApiResponse.success("Lấy thông tin tài khoản thành công", accountDTO.get()));
        } else {

            return ResponseEntity.status(404)
                    .body(ApiResponse.error(404, "Không tìm thấy người dùng với ID: " + accountID));
        }
    }

    @GetMapping("/getAllUser")
    public ResponseEntity<ApiResponse<ResultPaginationDTO>> getAllUser(
            @Filter Specification<Account> spec,
            Pageable pageable) {

        ResultPaginationDTO data = this.accountService.handleGetAllUser(spec, pageable);

        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách tài khoản thành công", data));
    }

    @DeleteMapping("/deleteUser/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUserByID(@PathVariable("id") Integer accountID) {
        boolean isDeleted = this.accountService.handleDeleteUser(accountID);
        if (isDeleted) {
            return ResponseEntity.ok(ApiResponse.success("Xóa tài khoản thành công", null));
        } else {
            return ResponseEntity.status(404)
                    .body(ApiResponse.error(404, "Không tìm thấy người dùng với ID: " + accountID));
        }
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<ResultPaginationDTO>> searchAccount(
            @RequestParam("name") String accountName,
            Pageable pageable) {

        ResultPaginationDTO data = this.accountService.searchByAccountName(accountName, pageable);

        return ResponseEntity.ok(
                ApiResponse.success("Tìm kiếm danh sách tài khoản thành công", data));
    }
}
