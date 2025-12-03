package com.backend.appvengers.config;

import com.backend.appvengers.entity.Category;
import com.backend.appvengers.entity.User;
import com.backend.appvengers.repository.CategoryRepository;
import com.backend.appvengers.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class CategorySeeder {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public CategorySeeder(CategoryRepository categoryRepository, UserRepository userRepository) {
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
    }

    @PostConstruct
    public void backfillMissingCategories() {
        List<User> users = userRepository.findAll();

        for (User user : users) {
            boolean hasCategories = categoryRepository.existsByUserId(user.getId());
            if (!hasCategories) {
                seedDefaultsForUser(user.getId());
            }
        }
    }

    private void seedDefaultsForUser(Integer userId) {
        List<Category> defaults = List.of(
            new Category(userId, "Housing", "expense"),
            new Category(userId, "Transport", "expense"),
            new Category(userId, "Utilities", "expense"),
            new Category(userId, "Entertainment", "expense"),
            new Category(userId, "Food", "expense"),
            new Category(userId, "Savings", "income")
        );

        categoryRepository.saveAll(defaults);
        System.out.println("Seeded default categories for user " + userId);
    }
}