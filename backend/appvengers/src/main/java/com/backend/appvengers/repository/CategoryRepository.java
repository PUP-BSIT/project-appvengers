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
}