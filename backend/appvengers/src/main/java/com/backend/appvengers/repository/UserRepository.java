package com.backend.appvengers.repository;

import com.backend.appvengers.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByUsername(String username);
    
    Optional<User> findByEmail(String email);
    
    boolean existsByUsername(String username);
    
    boolean existsByEmail(String email);

    Optional<User> findByEmailVerificationToken(String token);

    Optional<User> findByPasswordResetToken(String token);

    // Query methods that bypass @SQLRestriction to include soft-deleted users
    @Query("SELECT u FROM User u WHERE u.email = :email")
    Optional<User> findByEmailIncludingDeleted(@Param("email") String email);

    @Query("SELECT u FROM User u WHERE u.username = :username")
    Optional<User> findByUsernameIncludingDeleted(@Param("username") String username);

    // Check if email exists including deleted accounts (for preventing re-registration)
    @Query("SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END FROM User u WHERE u.email = :email")
    boolean existsByEmailIncludingDeleted(@Param("email") String email);

    // Check if username exists including deleted accounts
    @Query("SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END FROM User u WHERE u.username = :username")
    boolean existsByUsernameIncludingDeleted(@Param("username") String username);
}