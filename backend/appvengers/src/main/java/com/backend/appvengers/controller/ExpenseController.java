package com.backend.appvengers.controller;

import com.backend.appvengers.dto.ApiResponse;
import com.backend.appvengers.dto.ExpenseSummary;
import com.backend.appvengers.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class ExpenseController {

    private final TransactionService transactionService;

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse> summary(Authentication auth) {
        String email = auth.getName();
        ExpenseSummary summary = transactionService.getExpenseSummary(email);
        return ResponseEntity.ok(new ApiResponse(true, "Expense summary fetched", summary));
    }
}