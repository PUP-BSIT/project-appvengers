package com.backend.appvengers.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.backend.appvengers.entity.Category;

public interface CategoryRepository extends JpaRepository<Category, Integer> {
    List<Category> findByUserId(Integer userId);
    boolean existsByUserId(Integer userId);
}