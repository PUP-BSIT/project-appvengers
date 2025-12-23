package com.backend.appvengers.repository;

import java.util.List;
import java.util.Set;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    /**
     * Count references to this category from transactions and budgets.
     * Only counts non-deleted records (deleted_at IS NULL).
     */
    @Query(value =
        "SELECT (SELECT COALESCE(COUNT(*),0) " +
        "FROM tbl_transaction " +
        "WHERE category_id = :categoryId " +
        "AND deleted_at IS NULL) + " +
        "(SELECT COALESCE(COUNT(*),0) " +
        "FROM tbl_budget " +
        "WHERE category_id = :categoryId " +
        "AND deleted_at IS NULL)",
        nativeQuery = true)
    Integer countReferencesByCategoryId(
        @Param("categoryId") Integer categoryId
    );
}