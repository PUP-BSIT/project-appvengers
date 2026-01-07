package com.backend.appvengers.config;

import com.backend.appvengers.entity.Category;
import com.backend.appvengers.entity.User;
import com.backend.appvengers.repository.CategoryRepository;
import com.backend.appvengers.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Set;

@Slf4j
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
        
        // Batch query: get all user IDs that already have categories (single query)
        Set<Integer> usersWithCategories = categoryRepository.findAllUserIdsWithCategories();
        
        int seededCount = 0;
        for (User user : users) {
            if (!usersWithCategories.contains(user.getId())) {
                seedDefaultsForUser(user.getId());
                seededCount++;
            }
        }
        
        if (seededCount > 0) {
            log.info("Seeded default categories for {} users", seededCount);
        }
    }

    @SuppressWarnings("null")
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
        log.debug("Seeded default categories for user {}", userId);
    }
}