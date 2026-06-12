package Ai_Study_Hub.Controller;

import org.springframework.web.bind.annotation.RestController;

import Ai_Study_Hub.Domain.Account;
import Ai_Study_Hub.Service.UserService;
import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;

@RestController
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;

    }

    @PostMapping("/auth/createAccount")
    public ResponseEntity<Account> createAccount(@Valid @RequestBody Account ac) {

        Account account = this.userService.handleCreateUser(ac);
        return ResponseEntity.status(HttpStatus.CREATED).body(null);
    }

    @PutMapping("/auth/updateAccount")
    public ResponseEntity<Account> updateAccount(@Valid @RequestBody Account ac) {
        Account newaAccount = this.userService.handleUpdateAccount(ac);
        return ResponseEntity.ok().body(null);
    }

    @DeleteMapping("/auth/account/{id}")
    public ResponseEntity<String> deleteAccount(@PathVariable Integer id) {
        this.userService.handleDeleteUserByid(id);
        return ResponseEntity.ok("delete success");
    }
}
