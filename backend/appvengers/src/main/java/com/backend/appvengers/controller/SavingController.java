package com.backend.appvengers.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.appvengers.dto.ApiResponse;
import com.backend.appvengers.dto.SavingTransaction;
import com.backend.appvengers.entity.Saving;
import com.backend.appvengers.entity.User;
import com.backend.appvengers.repository.SavingRepository;
import com.backend.appvengers.repository.UserRepository;
import com.backend.appvengers.service.SavingService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class SavingController {

  private final SavingRepository savingRepository;
  private final UserRepository userRepository;
  private final SavingService savingService;

  private int currentUserId(Authentication auth) {
    String email = auth.getName();
    User user = userRepository.findByEmail(email)
        .orElseThrow(() -> new RuntimeException("User not found"));
    return user.getId();
  }

  // Working Endpoint: Get all active savings for current user
  @GetMapping("/savings")
  public List<Saving> getAllSavings(Authentication auth) {
    int userId = currentUserId(auth);
    return savingRepository.findActiveSavingsByUserId(userId);
  }

  // Additional endpoints (create, update, delete) can be added here
  // Working Endpoint: Get savings by saving_id with the current user
  @GetMapping("/savings/{id}")
  public Saving getSavingById(@PathVariable Integer id, Authentication auth) {
    int userId = currentUserId(auth);
    Saving saving = savingRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Saving not found"));
    if (saving.getUserId() != userId) {
      throw new RuntimeException("Unauthorized access to saving");
    }
    return saving;
  }

  // Working Endpoint: Add new saving 
  @PostMapping("/savings")
  public Saving createSaving(@RequestBody Saving saving, Authentication auth) {
    int userId = currentUserId(auth);
    saving.setUserId(userId);
    return savingRepository.save(saving);
  }

  // Working Endpoint: Update Saving
  @PutMapping("/savings/{id}")
  public Saving updateSaving(@PathVariable Integer id, @RequestBody Saving savingDetails, Authentication auth) {
    int userId = currentUserId(auth);
    Saving saving = savingRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Saving not found with id " + id));
    if (saving.getUserId() != userId) {
      throw new RuntimeException("Unauthorized to access this resource");
    }

    // Update saving fields
    saving.setName(savingDetails.getName());
    saving.setGoalDate(savingDetails.getGoalDate());
    saving.setFrequency(savingDetails.getFrequency());
    saving.setTargetAmount(savingDetails.getTargetAmount());
    saving.setCurrentAmount(savingDetails.getCurrentAmount());
    saving.setDescription(savingDetails.getDescription());
    return savingRepository.save(saving);
  }

  // Working Endpoint: Soft Delete Saving
  @DeleteMapping("/savings/{id}")
  public ResponseEntity<Void> deleteSaving(@PathVariable Integer id, Authentication auth) {
    int userId = currentUserId(auth);
    Saving saving = savingRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Saving not found with id " + id));
    if (saving.getUserId() != userId) {
      throw new RuntimeException("Unauthorized to delete this resource");
    }

    // Soft delete the saving if found
    savingRepository.delete(saving);
    return ResponseEntity.noContent().build();
  }

  // Fetch saving transactions
  @GetMapping("/savings/transactions")
  public List<SavingTransaction> getSavingTransactions(Authentication auth) {
    int userId = currentUserId(auth);
    return savingRepository.fetchTransactionWithSavingDetails(userId);
  }

  // Fetch saving transactions by savingId
  @GetMapping("/savings/{savingId}/transactions")
  public List<SavingTransaction> getSavingTransactionsBySavingId(@PathVariable Integer savingId, Authentication auth) {
    int userId = currentUserId(auth);
    return savingRepository.fetchSavingsTransactionById(savingId, userId);
  }

  // Refresh current amount for a saving
  @GetMapping("/savings/{savingId}/refresh-current-amount")
  public ResponseEntity<ApiResponse> refreshCurrentAmount(@PathVariable Integer savingId, Authentication auth) {
    int userId = currentUserId(auth);
    Saving saving = savingRepository.findById(savingId)
        .orElseThrow(() -> new RuntimeException("Saving not found with id " + savingId));
        
    if (saving.getUserId() != userId) {
      return ResponseEntity.status(403).body(new ApiResponse(false, "Unauthorized to access this resource"));
    }

    savingService.refreshCurrentAmount(savingId);
    return ResponseEntity.ok(new ApiResponse(true, "Current amount refreshed successfully"));
  }
}