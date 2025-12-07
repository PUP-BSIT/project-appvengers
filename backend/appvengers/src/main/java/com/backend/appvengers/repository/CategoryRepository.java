package com.backend.appvengers.repository;

import java.util.List;
import java.util.Set;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import com.backend.appvengers.entity.Category;

public interface CategoryRepository extends JpaRepository<Category, Integer> {
    List<Category> findByUserId(Integer userId);
    boolean existsByUserId(Integer userId);
    
    /**
     * Returns all user IDs that have at least one category.
     * Used for efficient batch checking to avoid N+1 queries.
     */
    @Query("SELECT DISTINCT c.userId FROM Category c")
    Set<Integer> findAllUserIdsWithCategories();
}