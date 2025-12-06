package com.backend.appvengers.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.backend.appvengers.entity.Category;
import com.backend.appvengers.entity.User;
import com.backend.appvengers.repository.CategoryRepository;
import com.backend.appvengers.repository.UserRepository;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = {
    "http://localhost:4200",
    "https://i-budget.site",
    "https://www.i-budget.site"
}, allowCredentials = "true")

public class CategoryController {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private UserRepository userRepository;

    private int currentUserId(Authentication auth) {
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }

    // Get all categories for current user
    @GetMapping
    public List<Category> getCategories(Authentication auth) {
        int userId = currentUserId(auth);
        return categoryRepository.findByUserId(userId);
    }

    // Add a new category for current user
    @PostMapping
    public Category createCategory(
        @RequestBody Category category,
        Authentication auth
    ) {
        int userId = currentUserId(auth);
        category.setUserId(userId);
        return categoryRepository.save(category);
    }

    // Delete a category for current user
    @DeleteMapping("/{id}")
    public void deleteCategory(
        @PathVariable Integer id,
        Authentication auth
    ) {
        int userId = currentUserId(auth);
        Category category = categoryRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Category not found"));
        if (!category.getUserId().equals(userId)) {
            throw new RuntimeException(
                "Unauthorized to delete this category"
            );
        }
        categoryRepository.delete(category);
    }
}