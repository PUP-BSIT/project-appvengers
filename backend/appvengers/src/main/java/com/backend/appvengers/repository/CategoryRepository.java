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
     * Returns categories for a user with reference counts.
     * Counts references from transactions and budgets (non-deleted only).
     */
    @Query(value =
        "SELECT c.category_id AS id, " +
        "       c.user_id AS userId, " +
        "       c.name AS name, " +
        "       c.type AS type, " +
        "       (SELECT COUNT(*) FROM tbl_transaction t " +
        "        WHERE t.category_id = c.category_id " +
        "        AND t.deleted_at IS NULL) + " +
        "       (SELECT COUNT(*) FROM tbl_budget b " +
        "        WHERE b.category_id = c.category_id " +
        "        AND b.deleted_at IS NULL) AS referencesCount " +
        "FROM tbl_category c " +
        "WHERE c.user_id = :userId", nativeQuery = true)
    List<Object[]> findCategoriesWithCounts(@Param("userId") Integer userId);

    /**
     * Count references for a single category (transactions + budgets).
     * Used to guard edit/delete operations.
     */
    @Query(value =
        "SELECT (SELECT COUNT(*) FROM tbl_transaction t " +
        "        WHERE t.category_id = :categoryId " +
        "        AND t.deleted_at IS NULL) + " +
        "       (SELECT COUNT(*) FROM tbl_budget b " +
        "        WHERE b.category_id = :categoryId " +
        "        AND b.deleted_at IS NULL)",
        nativeQuery = true)
    int countReferences(@Param("categoryId") Integer categoryId);
}