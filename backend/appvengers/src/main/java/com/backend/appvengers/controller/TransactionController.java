package com.backend.appvengers.controller;

import com.backend.appvengers.dto.ApiResponse;
import com.backend.appvengers.dto.BudgetExpenseRequest;
import com.backend.appvengers.dto.BudgetExpenseResponse;
import com.backend.appvengers.dto.ExpenseSummary;
import com.backend.appvengers.dto.IncomeSummary;
import com.backend.appvengers.dto.MonthlyReportResponse;
import com.backend.appvengers.entity.Transaction;
import com.backend.appvengers.dto.TransactionRequest;
import com.backend.appvengers.dto.TransactionResponse;
import com.backend.appvengers.dto.TransactionWithCategoryResponse;
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

    @GetMapping("/with-category")
    public ResponseEntity<ApiResponse> listWithCategory(
            Authentication auth) {
        String email = auth.getName();
        List<TransactionWithCategoryResponse> txs = transactionService.findAllWithCategory(email);
        return ResponseEntity.ok(new ApiResponse(true, "Transactions with category fetched", txs));
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

    // Expense summary endpoint
    @GetMapping("/summary/expense")
    public ResponseEntity<ApiResponse> getExpenseSummary(Authentication auth) {
        String email = auth.getName();
        ExpenseSummary summary = transactionService.getExpenseSummary(email);
        return ResponseEntity.ok(new ApiResponse(true, "Expense summary fetched", summary));
    }

    // Income summary endpoint
    @GetMapping("/summary/income")
    public ResponseEntity<ApiResponse> getIncomeSummary(Authentication auth) {
        String email = auth.getName();
        IncomeSummary summary = transactionService.getIncomeSummary(email);
        return ResponseEntity.ok(new ApiResponse(true, "Income summary fetched", summary));
    }

    // Monthly reports endpoint - returns last month and this month totals
    @GetMapping("/reports/monthly")
    public ResponseEntity<ApiResponse> getMonthlyReports(Authentication auth) {
        System.out.println("=== Monthly Reports Endpoint Called ===");
        System.out.println("Authentication object: " + (auth != null ? "Present" : "Null"));
        
        if (auth == null) {
            System.out.println("ERROR: Authentication is null!");
            return ResponseEntity.status(403).body(
                new ApiResponse(false, "Authentication required", null)
            );
        }
        
        String email = auth.getName();
        System.out.println("User email: " + email);
        
        try {
            List<MonthlyReportResponse> reports = transactionService.getMonthlyReports(email);
            System.out.println("Reports generated successfully: " + reports.size() + " reports");
            return ResponseEntity.ok(new ApiResponse(true, "Monthly reports fetched", reports));
        } catch (Exception e) {
            System.out.println("ERROR in getMonthlyReports: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(
                new ApiResponse(false, "Error fetching reports: " + e.getMessage(), null)
            );
        }
    }

    // Budget Transaction endpoint [POST]
    @PostMapping("/budget-transactions")
    public ResponseEntity<ApiResponse> createBudgetExpense(
            @RequestBody BudgetExpenseRequest req) {

        try {
            Transaction tx = transactionService.createBudgetExpense(req);
            BudgetExpenseResponse dto = transactionService.toBudgetExpenseResponse(tx);

            return ResponseEntity.ok(
                new ApiResponse(
                    true,
                    "Budget expense created successfully",
                    dto
                )
            );

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                new ApiResponse(
                    false,
                    e.getMessage(),
                    null
                )
            );
        }
    } 

    // Budget Transaction endpoint [GET]
    @GetMapping("/budget-transactions/budget/{budgetId}")
    public ResponseEntity<ApiResponse> getBudgetExpenses(@PathVariable Integer budgetId) {
        List<BudgetExpenseResponse> list = transactionService.findByBudgetId(budgetId);

        return ResponseEntity.ok(
            new ApiResponse(true, "Budget expenses fetched", list)
        );
    }
}