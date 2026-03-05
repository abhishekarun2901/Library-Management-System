package com.library.lbms.controller;

import com.library.lbms.dto.request.TransactionRequest; 
import com.library.lbms.dto.response.TransactionResponse;
import com.library.lbms.service.TransactionService;
import com.library.lbms.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/v1/transactions") 
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<TransactionResponse>> getTransactions(Authentication authentication) {
        boolean admin = authentication.getAuthorities()
                .stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));

        if (admin) {
            return ResponseEntity.ok(transactionService.getAllTransactions());
        }

        return ResponseEntity.ok(
                transactionService.getUserTransactions(userService.getCurrentUserProfile().getUserId()));
    }

    @PostMapping
    public ResponseEntity<TransactionResponse> issueBook(@RequestBody TransactionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(transactionService.issueBook(request));
    }

    @PatchMapping("/{transaction_id}")
    public ResponseEntity<TransactionResponse> updateTransaction(
            @PathVariable("transaction_id") UUID transactionId, 
            @RequestBody TransactionRequest request) {
        return ResponseEntity.ok(transactionService.updateTransaction(transactionId, request));
    }
}
