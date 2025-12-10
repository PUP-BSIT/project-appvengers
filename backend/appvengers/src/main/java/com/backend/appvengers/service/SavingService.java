package com.backend.appvengers.service;

import org.springframework.stereotype.Service;

import com.backend.appvengers.repository.SavingRepository;

import jakarta.transaction.Transactional;

@Service
public class SavingService {
  private final SavingRepository savingRepository;

  public SavingService(SavingRepository savingRepository) {
    this.savingRepository = savingRepository;
  }

  @Transactional
  public void refreshCurrentAmount(int savingId) {
    Double netAmount = savingRepository.getNetAmountBySavingId(savingId);
    savingRepository.updateCurrentAmount(savingId, netAmount);
  }
}
