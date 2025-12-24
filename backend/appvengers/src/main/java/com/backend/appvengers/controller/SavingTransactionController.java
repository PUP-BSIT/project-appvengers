package com.backend.appvengers.controller;

import com.backend.appvengers.dto.ApiResponse;
import com.backend.appvengers.dto.SavingTransaction;
import com.backend.appvengers.dto.SavingTransactionRequest;
import com.backend.appvengers.entity.Saving;
import com.backend.appvengers.entity.Transaction;
import com.backend.appvengers.entity.User;
import com.backend.appvengers.repository.SavingRepository;
import com.backend.appvengers.repository.TransactionRepository;
import com.backend.appvengers.repository.UserRepository;
import com.backend.appvengers.service.NotificationService;
import com.backend.appvengers.service.SavingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class SavingTransactionController {

  private final SavingRepository savingRepository;
  private final TransactionRepository transactionRepository;
  private final UserRepository userRepository;
  private final SavingService savingService;
  private final NotificationService notificationService;

  private int currentUserId(Authentication auth) {
    String email = auth.getName();
    User user = userRepository.findByEmail(email)
        .orElseThrow(() -> new RuntimeException("User not found"));
    return user.getId();
  }

  // DONE: Add saving transaction
  @PostMapping("/savings/{savingId}/transactions")
  public SavingTransaction addSavingTransaction(@PathVariable Integer savingId,
                                                @RequestBody SavingTransactionRequest req,
                                                Authentication auth) {
    int userId = currentUserId(auth);
    Saving saving = savingRepository.findById(savingId)
        .orElseThrow(() -> new RuntimeException("Saving not found"));
    if (saving.getUserId() != userId) {
      throw new RuntimeException("Unauthorized access to saving");
    }

    User user = userRepository.findById((long) userId)
        .orElseThrow(() -> new RuntimeException("User not found"));

    Transaction t = new Transaction();
    t.setSaving(saving);
    t.setUser(user);
    t.setAmount(req.getAmount());
    t.setDescription(req.getDescription());
    t.setSavingsAction(req.getSavingsAction());
    t.setTransactionDate(req.getTransactionDate());
    // Map category and type for general Transaction entity
    
    Transaction saved = transactionRepository.save(t);
    
    // Update the saving's current amount and check for milestones/completion
    try {
      savingService.refreshCurrentAmount(savingId);
      notificationService.generateNotifications(userId);
      log.info("Savings notifications checked for user {} after transaction", userId);
    } catch (Exception e) {
      log.error("Failed to generate savings notifications for user {}: {}", userId, e.getMessage());
    }

    return new SavingTransaction(
        saved.getId(),
        saving.getSavingId(),
        user.getId(),
        saved.getTransactionDate(),
        saved.getSavingsAction(),
        saved.getDescription(),
        saved.getAmount(),
        saved.getCreatedAt(),
        saved.getUpdatedAt(),
        saved.getDeletedAt()
    );
  }

  // DONE: Get saving transaction by ID
  @GetMapping("savings/{savingId}/transactions/{id}")
  public ResponseEntity<?> getSavingTransactionById(@PathVariable Integer savingId,
                                                    @PathVariable Long id,
                                                    Authentication auth) {
    int userId = currentUserId(auth);

    Transaction transaction = transactionRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Transaction not found"));

    if (transaction.getUser().getId() != userId) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(new ApiResponse(false, "Unauthorized access to transaction"));
    }

    if (transaction.getSaving().getSavingId() != savingId) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(new ApiResponse(false, "Transaction does not belong to the specified saving"));
    }

    Saving saving = transaction.getSaving();
    SavingTransaction dto = new SavingTransaction(
        transaction.getId(),
        saving.getSavingId(),
        transaction.getUser().getId(),
        transaction.getTransactionDate(),
        transaction.getSavingsAction(),
        transaction.getDescription(),
        transaction.getAmount(),
        transaction.getCreatedAt(),
        transaction.getUpdatedAt(),
        transaction.getDeletedAt()
    );

    return ResponseEntity.ok(dto);
  }

  // Update Saving Transaction
  @PutMapping("/savings/{savingId}/transactions/{id}")
  public ResponseEntity<?> updateSavingTransaction(@PathVariable Integer savingId,
                                                  @PathVariable Long id,
                                                  @RequestBody SavingTransactionRequest req,
                                                  Authentication auth) {
    int userId = currentUserId(auth);

    Transaction transaction = transactionRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Transaction not found"));

    if (transaction.getUser().getId() != userId) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(new ApiResponse(false, "Unauthorized access to transaction")); 
    }

    if (transaction.getSaving().getSavingId() != savingId) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(new ApiResponse(false, "Transaction does not belong to the specified saving"));
    }

    // Update fields
    transaction.setAmount(req.getAmount());
    transaction.setDescription(req.getDescription());
    transaction.setSavingsAction(req.getSavingsAction());
    transaction.setTransactionDate(req.getTransactionDate());
    Transaction updated = transactionRepository.save(transaction);
    
    // Update the saving's current amount and check for milestones/completion
    try {
      savingService.refreshCurrentAmount(savingId);
      notificationService.generateNotifications(userId);
      log.info("Savings notifications checked for user {} after transaction update", userId);
    } catch (Exception e) {
      log.error("Failed to generate savings notifications for user {}: {}", userId, e.getMessage());
    }

    Saving saving = transaction.getSaving();
    SavingTransaction dto = new SavingTransaction(
        updated.getId(),
        saving.getSavingId(),
        updated.getUser().getId(),
        updated.getTransactionDate(),
        updated.getSavingsAction(),
        updated.getDescription(),
        updated.getAmount(),
        updated.getCreatedAt(),
        updated.getUpdatedAt(),
        updated.getDeletedAt()
    );

    return ResponseEntity.ok(dto);
  }

  // DONE: Soft Delete Saving Transaction
  @DeleteMapping("/savings/{savingId}/transactions/{id}")
  public ResponseEntity<?> deleteSavingTransaction(@PathVariable Integer savingId,
                                                   @PathVariable Long id,
                                                   Authentication auth) {
    int userId = currentUserId(auth);

    Transaction transaction = transactionRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Transaction not found"));

    if (transaction.getUser().getId() != userId) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(new ApiResponse(false, "Unauthorized access to transaction"));
    }

    if (transaction.getSaving().getSavingId() != savingId) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(new ApiResponse(false, "Transaction does not belong to the specified saving"));
    }

    // Soft delete by setting deletedAt
    transaction.setDeletedAt(java.time.LocalDate.now());
    transactionRepository.save(transaction);
    
    // Update the saving's current amount after delete
    try {
      savingService.refreshCurrentAmount(savingId);
      notificationService.generateNotifications(userId);
      log.info("Savings notifications checked for user {} after transaction delete", userId);
    } catch (Exception e) {
      log.error("Failed to generate savings notifications for user {}: {}", userId, e.getMessage());
    }
    
    return ResponseEntity.noContent().build();
  }

  // DONE: Soft delete multiple savings transactions endpoint
  @DeleteMapping("/savings/transactions")
  public ResponseEntity<ApiResponse> deleteMultipleSavingTransactions(@RequestBody List<Long> transactionIds, Authentication auth) {
    int userId = currentUserId(auth);
    
    if (transactionIds == null || transactionIds.isEmpty()) {
       return ResponseEntity.ok(new ApiResponse(true, "No transactions to delete"));
    }

    List<Transaction> transactions = transactionRepository.findAllById(transactionIds);

    // Validate ownership
    for (Transaction t : transactions) {
        if (t.getUser().getId() != userId) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ApiResponse(false, "Unauthorized access to transaction " + t.getId()));
        }
    }

    // Soft delete
    LocalDate now = LocalDate.now();
    Set<Integer> savingIdsToRefresh = new HashSet<>();
    
    for (Transaction t : transactions) {
        t.setDeletedAt(now);
        if (t.getSaving() != null) {
            savingIdsToRefresh.add(t.getSaving().getSavingId());
        }
    }
    
    transactionRepository.saveAll(transactions);

    // Refresh amounts
    for (Integer savingId : savingIdsToRefresh) {
        try {
            savingService.refreshCurrentAmount(savingId);
        } catch (Exception e) {
            // Log error but don't fail the request
            log.error("Failed to refresh current amount for saving {}: {}", savingId, e.getMessage());
        }
    }
    
    // Check notifications once
    try {
        notificationService.generateNotifications(userId);
    } catch (Exception e) {
         // Log error
        log.error("Failed to generate savings notifications for user {}: {}", userId, e.getMessage());
    }

    return ResponseEntity.ok(new ApiResponse(true, "Transactions deleted successfully"));
  }
}