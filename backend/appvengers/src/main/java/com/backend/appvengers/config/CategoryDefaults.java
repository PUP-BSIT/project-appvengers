package com.backend.appvengers.config;

import java.util.List;
import org.springframework.stereotype.Component;
import com.backend.appvengers.entity.Category;

@Component
public class CategoryDefaults {

    public List<Category> buildDefaultsForUser(Integer userId) {
        return List.of(
            new Category(userId, "Housing", "expense"),
            new Category(userId, "Transport", "expense"),
            new Category(userId, "Utilities", "expense"),
            new Category(userId, "Entertainment", "expense"),
            new Category(userId, "Healthcare", "expense"),
            new Category(userId, "Food", "expense"),
            new Category(userId, "Other", "expense"),
            new Category(userId, "Salary", "income"),
            new Category(userId, "Bonus", "income"),
            new Category(userId, "Investments", "income")
        );
    }
}