package com.backend.appvengers.controller;

import com.backend.appvengers.dto.ApiResponse;
import com.backend.appvengers.dto.ExpenseSummary;
import com.backend.appvengers.dto.TransactionRequest;
import com.backend.appvengers.dto.TransactionResponse;
import com.backend.appvengers.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class TransactionController {

    private final TransactionService transactionService;

    @GetMapping
    public ResponseEntity<ApiResponse> list(Authentication auth) {
        String email = auth.getName();
        List<TransactionResponse> txs = transactionService.findAllForUser(email);
        return ResponseEntity.ok(new ApiResponse(true, "Transactions fetched", txs));
    }

    @PostMapping
    public ResponseEntity<ApiResponse> create(@Valid @RequestBody TransactionRequest req,
                                              BindingResult bindingResult,
                                              Authentication auth) {
        if (bindingResult.hasErrors()) {
            return ResponseEntity.badRequest().body(
                new ApiResponse(false, "Validation failed",
                    Map.of("errors", bindingResult.getFieldErrors()))
            );
        }

        String email = auth.getName();
        TransactionResponse created = transactionService.create(email, req);
        return ResponseEntity.status(201).body(
            new ApiResponse(true, "Transaction created", created)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse> update(@PathVariable Long id,
                                              @Valid @RequestBody TransactionRequest req,
                                              BindingResult bindingResult,
                                              Authentication auth) {
        if (bindingResult.hasErrors()) {
            return ResponseEntity.badRequest().body(
                new ApiResponse(false, "Validation failed",
                    Map.of("errors", bindingResult.getFieldErrors()))
            );
        }

        String email = auth.getName();
        TransactionResponse updated = transactionService.update(email, id, req);
        return ResponseEntity.ok(new ApiResponse(true, "Transaction updated", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> delete(@PathVariable Long id, Authentication auth) {
        String email = auth.getName();
        transactionService.delete(email, id);
        return ResponseEntity.ok(new ApiResponse(true, "Transaction deleted"));
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse> summary(Authentication auth) {
        String email = auth.getName();
        ExpenseSummary summary = transactionService.getExpenseSummary(email);
        return ResponseEntity.ok(new ApiResponse(true, "Expense summary fetched", summary));
    }
}