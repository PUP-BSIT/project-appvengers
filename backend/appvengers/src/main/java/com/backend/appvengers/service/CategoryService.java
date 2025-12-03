package com.backend.appvengers.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.backend.appvengers.repository.CategoryRepository;
import com.backend.appvengers.config.CategoryDefaults;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryDefaults categoryDefaults;

    public CategoryService(
        CategoryRepository categoryRepository, 
        CategoryDefaults categoryDefaults) {
            
        this.categoryRepository = categoryRepository;
        this.categoryDefaults = categoryDefaults;
    }

    @Transactional
    public void seedDefaultsIfMissing(Integer userId) {
        if (!categoryRepository.existsByUserId(userId)) {
            var defaults = categoryDefaults.buildDefaultsForUser(userId);
            categoryRepository.saveAll(defaults);
        }
    }
}