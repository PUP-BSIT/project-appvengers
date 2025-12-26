package com.backend.appvengers.controller;

import java.util.List;
import java.util.ArrayList;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.backend.appvengers.entity.Category;
import com.backend.appvengers.entity.User;
import com.backend.appvengers.repository.CategoryRepository;
import com.backend.appvengers.repository.UserRepository;
import com.backend.appvengers.dto.CategoryWithCountResponse;

@RestController
@RequestMapping("/api/categories")

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

    // Get all categories for current user, including how many times each is referenced
    @GetMapping
    public List<CategoryWithCountResponse> getCategories(Authentication auth) {
        int userId = currentUserId(auth);
        List<Object[]> rows = categoryRepository.findCategoriesWithCounts(userId);

        List<CategoryWithCountResponse> resp = new ArrayList<>();
        for (Object[] row : rows) {
            resp.add(new CategoryWithCountResponse(
                (Integer) row[0],   // id
                (Integer) row[1],   // userId
                (String) row[2],    // name
                (String) row[3],    // type
                ((Number) row[4]).intValue() // referencesCount
            ));
        }
        return resp;
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

    @PutMapping("/{id}")
    public Category updateCategory(
        @PathVariable Integer id,
        @RequestBody Category updatedCategory,
        Authentication auth
    ) {
        int userId = currentUserId(auth);

        Category category = categoryRepository.findById(id)
            .orElseThrow(() -> new RuntimeException(
                "Category not found"
            ));

        if (!category.getUserId().equals(userId)) {
            throw new RuntimeException(
                "Unauthorized to edit this category"
            );
        }

        // Check transaction references before allowing edit
        int refCount = categoryRepository.countReferences(id);
        if (refCount > 0) {
            throw new RuntimeException(
                "Category is used and cannot be edited"
            );
        }

        category.setName(updatedCategory.getName());
        category.setType(updatedCategory.getType());

        return categoryRepository.save(category);
    }
}