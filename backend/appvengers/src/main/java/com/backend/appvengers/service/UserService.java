package com.backend.appvengers.service;

import com.backend.appvengers.dto.SignupRequest;
import com.backend.appvengers.dto.LoginRequest;
import com.backend.appvengers.dto.ApiResponse;
import com.backend.appvengers.dto.AuthResponse;
import com.backend.appvengers.dto.ResetPasswordRequest;
import com.backend.appvengers.dto.ChangePasswordRequest;
import com.backend.appvengers.dto.DeactivateAccountRequest;
import com.backend.appvengers.dto.DeleteAccountRequest;
import com.backend.appvengers.dto.ReactivateAccountRequest;
import com.backend.appvengers.dto.UpdateAccountRequest;
import com.backend.appvengers.entity.User;
import com.backend.appvengers.repository.UserRepository;
import com.backend.appvengers.security.JwtService;

import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;

import java.io.IOException;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final CategoryService categoryService;
    private final JwtService jwtService;
    private final EmailService emailService;

    @Value("${app.verification.base-url:http://localhost:8081/api/auth/verify-email?token=}")
    private String verificationBaseUrl;

    @Value("${app.verification.expiration:24}")
    private long verificationExpirationHours;

    @Value("${app.verification.resend-cooldown-minutes:10}")
    private long verificationResendCooldownMinutes;

    @Value("${app.email.from:noreply@ibudget.site}")
    private String emailFrom;

    @Value("${app.password-reset.frontend-url:http://localhost:4200/reset-password?token=}")
    private String passwordResetFrontendUrl;

    @Transactional
    public ApiResponse registerUser(SignupRequest signupRequest) {
        if (userRepository.existsByUsername(signupRequest.getUsername())) {
            throw new IllegalArgumentException("Username is already taken!");
        }

        if (userRepository.existsByEmail(signupRequest.getEmail())) {
            throw new IllegalArgumentException("Email is already registered!");
        }

        if (!signupRequest.getPassword().equals(signupRequest.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match!");
        }

        User user = new User();
        user.setUsername(signupRequest.getUsername());
        user.setEmail(signupRequest.getEmail());
        user.setPassword(passwordEncoder.encode(signupRequest.getPassword()));
        user.setActive(true); // User is active immediately but requires email verification
        user.setEmailVerified(false); // Set email verified to false

        // Set email verification token + expiry (e.g. 24 hours)
        String emailToken = UUID.randomUUID().toString();
        user.setEmailVerificationToken(emailToken);
        // 30 seconds for testing purposes
        user.setEmailVerificationExpiration(LocalDateTime.now().plusHours(24));

        userRepository.save(user);
        categoryService.seedDefaultsIfMissing(user.getId());

        // Send Verification Email Template
        String verificationLink = verificationBaseUrl + emailToken;
        try {
            emailService.sendHtmlEmail(emailFrom, user.getEmail(), "Verify your iBudget account", verificationLink,
                    user.getUsername());
        } catch (MessagingException | IOException e) {
            throw new RuntimeException("Failed to send verification email");
        }

        UserDetails userDetails = org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail())
                .password(user.getPassword())
                .authorities("ROLE_USER")
                .build();

        String token = jwtService.generateToken(userDetails);
        AuthResponse response = new AuthResponse(user.getUsername(), user.getEmail(), token);
        return new ApiResponse(true, "Signup successful, Please check your email.", response);
    }

    /* This checks and verifies the email token of the user */
    public ApiResponse verifyEmailToken(String token) {
        return userRepository.findByEmailVerificationToken(token)
                .map(user -> {
                    LocalDateTime expiry = user.getEmailVerificationExpiration();
                    if (expiry == null || LocalDateTime.now().isAfter(expiry)) {
                        // token expired: clear token and expiry to force re-send flow if needed
                        user.setEmailVerificationToken(null);
                        user.setEmailVerificationExpiration(null);
                        userRepository.save(user);
                        return new ApiResponse(false, "Verification token has expired");
                    }

                    // Sets email verified to true if token is valid or not expired
                    user.setEmailVerified(true);
                    user.setEmailVerificationToken(null);
                    user.setEmailVerificationExpiration(null);
                    userRepository.save(user);
                    return new ApiResponse(true, "Verification token is valid", user.getUsername());
                })
                .orElseGet(() -> new ApiResponse(false, "Invalid verification token"));
    }

    @Transactional
    public ApiResponse login(LoginRequest request) {
        // First check if this is a deleted account (bypassing @SQLRestriction)
        Optional<User> deletedUser = userRepository.findByEmailIncludingDeleted(request.getEmail());
        if (deletedUser.isPresent() && deletedUser.get().isDeleted()) {
            return new ApiResponse(false,
                    "This account has been deleted. Please contact support if you believe this is an error.");
        }

        Optional<User> optionalUser = userRepository.findByEmail(request.getEmail());
        User user = optionalUser.orElse(null);

        // Dummy hash to mitigate timing attacks
        String dummyHash = "$2a$10$CwTycUXWue0Thq9StjUM0uJ8fQx5QyQbYyQ5QyQ5QyQ5QyQ5QyQ5Qy";
        boolean passwordMatches = passwordEncoder.matches(
                request.getPassword(),
                user != null ? user.getPassword() : dummyHash);

        if (user == null || !passwordMatches) {
            if (user != null) {
                incrementFailedAttemptOrLock(user);
            }
            return new ApiResponse(false, "Invalid email or password");
        }

        if (isLocked(user)) {
            return new ApiResponse(false, "Account temporarily locked due to failed attempts. Please try again later.");
        }

        if (!user.isEmailVerified()) {
            return new ApiResponse(false, "Email not verified. Please check your email to verify your account.");
        }

        if (!user.isActive()) {
            Map<String, Object> data = Map.of("accountDeactivated", true, "email", user.getEmail());
            return new ApiResponse(false, "Account is not active. Would you like to reactivate it?", data);
        }

        resetLockout(user);

        UserDetails userDetails = org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail())
                .password(user.getPassword())
                .authorities("ROLE_USER")
                .build();

        String token = jwtService.generateToken(userDetails);
        AuthResponse response = new AuthResponse(user.getUsername(), user.getEmail(), token);
        return new ApiResponse(true, "Login successful", response);
    }

    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    // --- Lockout helpers ---

    private boolean isLocked(User user) {
        return user.getLockedUntil() != null && LocalDateTime.now().isBefore(user.getLockedUntil());
    }

    @Transactional
    protected void incrementFailedAttemptOrLock(User user) {
        int attempts = user.getFailedAttempts() + 1;
        user.setFailedAttempts(attempts);

        // Threshold: 5 failed attempts → lock for 15 minutes
        if (attempts >= 5) {
            user.setLockedUntil(LocalDateTime.now().plusMinutes(15));
            user.setFailedAttempts(0); // reset counter when locking
        }
        userRepository.save(user);
    }

    @Transactional
    protected void resetLockout(User user) {
        user.setFailedAttempts(0);
        user.setLockedUntil(null);
        userRepository.save(user);
    }

    // --- Password Reset Methods ---

    @Transactional
    public ApiResponse requestPasswordReset(String email) {
        Optional<User> optionalUser = userRepository.findByEmail(email);

        // Return success even if user doesn't exist (prevent user enumeration)
        if (optionalUser.isEmpty()) {
            return new ApiResponse(true, "If an account with that email exists, a password reset link has been sent.");
        }

        User user = optionalUser.get();

        // Check rate limiting (3 requests per hour)
        if (isPasswordResetRateLimited(user)) {
            return new ApiResponse(false, "Too many password reset requests. Please try again later.");
        }

        // Generate secure token
        String resetToken = UUID.randomUUID().toString();

        // Set token expiry (15 minutes)
        user.setPasswordResetToken(resetToken);
        user.setPasswordResetTokenExpiry(LocalDateTime.now().plusMinutes(15));

        // Update rate limiting fields
        user.setLastPasswordResetRequest(LocalDateTime.now());
        user.setPasswordResetAttempts(user.getPasswordResetAttempts() + 1);

        userRepository.save(user);

        // Send password reset email
        String resetLink = passwordResetFrontendUrl + resetToken;
        try {
            emailService.sendPasswordResetEmail(emailFrom, user.getEmail(), user.getUsername(), resetLink);
        } catch (MessagingException | IOException e) {
            throw new RuntimeException("Failed to send password reset email");
        }

        return new ApiResponse(true, "If an account with that email exists, a password reset link has been sent.");
    }

    public ApiResponse validateResetToken(String token) {
        Optional<User> optionalUser = userRepository.findByPasswordResetToken(token);

        if (optionalUser.isEmpty()) {
            return new ApiResponse(false, "Invalid or expired reset token");
        }

        User user = optionalUser.get();

        // Check if token is expired
        if (user.getPasswordResetTokenExpiry() == null ||
                LocalDateTime.now().isAfter(user.getPasswordResetTokenExpiry())) {
            return new ApiResponse(false, "Reset token has expired");
        }

        return new ApiResponse(true, "Token is valid");
    }

    @Transactional
    public ApiResponse resetPassword(ResetPasswordRequest request) {
        // Validate passwords match
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match");
        }

        // Find user by token
        Optional<User> optionalUser = userRepository.findByPasswordResetToken(request.getToken());

        if (optionalUser.isEmpty()) {
            throw new IllegalArgumentException("Invalid or expired reset token");
        }

        User user = optionalUser.get();

        // Check token expiry
        if (user.getPasswordResetTokenExpiry() == null ||
                LocalDateTime.now().isAfter(user.getPasswordResetTokenExpiry())) {
            throw new IllegalArgumentException("Reset token has expired");
        }

        // Update password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));

        // Clear reset token
        user.setPasswordResetToken(null);
        user.setPasswordResetTokenExpiry(null);

        // Reset failed login attempts and unlock account
        user.setFailedAttempts(0);
        user.setLockedUntil(null);

        // Update password changed timestamp
        user.setPasswordChangedAt(LocalDateTime.now());

        userRepository.save(user);

        // Send confirmation email
        try {
            emailService.sendSimpleEmail(
                    user.getEmail(),
                    "iBudget Password Changed",
                    "Your password has been successfully changed. If you didn't make this change, please contact support immediately.");
        } catch (Exception e) {
            // Log but don't fail the operation
            log.error("Failed to send password change confirmation email", e);
        }

        return new ApiResponse(true, "Password has been reset successfully");
    }

    @Transactional
    public ApiResponse changePassword(String username, ChangePasswordRequest request) {
        // Validate passwords match
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("New password and confirm password do not match");
        }

        // Find user by username
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }

        // Check if new password is same as current
        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new IllegalArgumentException("New password must be different from current password");
        }

        // Update password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));

        // Reset failed login attempts
        user.setFailedAttempts(0);
        user.setLockedUntil(null);

        // Update password changed timestamp
        user.setPasswordChangedAt(LocalDateTime.now());

        userRepository.save(user);

        // Send confirmation email
        try {
            emailService.sendSimpleEmail(
                    user.getEmail(),
                    "iBudget Password Changed",
                    "Your password has been successfully changed. If you didn't make this change, please contact support immediately.");
        } catch (Exception e) {
            log.error("Failed to send password change confirmation email", e);
        }

        return new ApiResponse(true, "Password has been changed successfully");
    }

    // --- Account Deactivation ---

    @Transactional
    public ApiResponse deactivateAccount(String email, DeactivateAccountRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Verify identity based on user type (OAuth vs local)
        verifyUserIdentity(user, request.getPassword(), request.getConfirmEmail());

        // Check if already deactivated
        if (!user.isActive()) {
            throw new IllegalArgumentException("Account is already deactivated");
        }

        // Deactivate account
        user.setActive(false);
        user.setDeactivatedAt(LocalDateTime.now());
        user.setDeactivationReason(request.getReason());

        userRepository.save(user);

        // Send confirmation email
        try {
            emailService.sendSimpleEmail(
                    user.getEmail(),
                    "iBudget Account Deactivated",
                    "Your iBudget account has been deactivated. You can reactivate it by logging in again or contacting support.");
        } catch (Exception e) {
            log.error("Failed to send account deactivation email", e);
        }

        return new ApiResponse(true, "Account has been deactivated successfully");
    }

    @Transactional
    public ApiResponse reactivateAccount(ReactivateAccountRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Verify password before allowing reactivation
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid password");
        }

        if (user.isActive()) {
            return new ApiResponse(true, "Account is already active");
        }

        // Check if account is soft-deleted (cannot reactivate deleted accounts)
        if (user.isDeleted()) {
            throw new IllegalArgumentException("Account has been permanently deleted and cannot be reactivated");
        }

        user.setActive(true);
        user.setDeactivatedAt(null);
        user.setDeactivationReason(null);

        userRepository.save(user);

        // Generate token for auto-login after reactivation
        UserDetails userDetails = org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail())
                .password(user.getPassword())
                .authorities("ROLE_USER")
                .build();

        String token = jwtService.generateToken(userDetails);
        AuthResponse authResponse = new AuthResponse(user.getUsername(), user.getEmail(), token);

        return new ApiResponse(true, "Account has been reactivated successfully", authResponse);
    }

    // --- Soft Delete Account ---

    @Transactional
    public ApiResponse softDeleteAccount(String email, DeleteAccountRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Verify identity based on user type (OAuth vs local)
        verifyUserIdentity(user, request.getPassword(), request.getConfirmEmail());

        // Set deletion metadata before triggering @SQLDelete
        user.setDeletionReason(request.getReason());

        // Save the reason first
        userRepository.save(user);

        // Now delete (triggers @SQLDelete which sets is_deleted=true and
        // deleted_at=NOW())
        userRepository.delete(user);

        // Send confirmation email
        try {
            emailService.sendSimpleEmail(
                    email,
                    "iBudget Account Deleted",
                    "Your iBudget account has been permanently deleted. All your data will be removed within 30 days. If you didn't request this, please contact support immediately.");
        } catch (Exception e) {
            log.error("Failed to send account deletion email", e);
        }

        return new ApiResponse(true, "Account has been deleted successfully");
    }

    public ApiResponse resendVerificationEmail(String email) {
        Optional<User> opt = userRepository.findByEmail(email);
        // avoid user enumeration: return generic success when user not found
        if (opt.isEmpty()) {
            return new ApiResponse(true, "If an account with that email exists, a verification email has been sent.");
        }

        User user = opt.get();

        if (user.isEmailVerified()) {
            return new ApiResponse(false, "Email already verified");
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime lastSent = user.getLastVerificationEmailSent();

        if (lastSent != null && now.isBefore(lastSent.plusMinutes(verificationResendCooldownMinutes))) {
            long waitMin = Duration.between(now, lastSent.plusMinutes(verificationResendCooldownMinutes)).toMinutes();
            return new ApiResponse(false,
                    "Too many requests. Please wait " + waitMin + " minutes before trying again.");
        }

        // generate new token (or reuse existing if you prefer)
        String newToken = UUID.randomUUID().toString();
        user.setEmailVerificationToken(newToken);
        user.setEmailVerificationExpiration(now.plusHours(verificationExpirationHours));
        user.setLastVerificationEmailSent(now);
        userRepository.save(user);

        String verificationLink = verificationBaseUrl + newToken;
        try {
            emailService.sendHtmlEmail(emailFrom, user.getEmail(), "Verify your iBudget account", verificationLink,
                    user.getUsername());
        } catch (Exception e) {
            // TODO: Enhance Logging
            return new ApiResponse(false, "Failed to send verification email. Please try again later.");
        }

        return new ApiResponse(true, "Verification email sent");
    }

    // Helper method for rate limiting
    private boolean isPasswordResetRateLimited(User user) {
        if (user.getLastPasswordResetRequest() == null) {
            return false;
        }

        LocalDateTime oneHourAgo = LocalDateTime.now().minusHours(1);
        boolean withinHour = user.getLastPasswordResetRequest().isAfter(oneHourAgo);

        // Reset counter if more than an hour has passed
        if (!withinHour) {
            user.setPasswordResetAttempts(0);
            return false;
        }

        return user.getPasswordResetAttempts() >= 3;
    }

    /**
     * Verifies user identity for destructive account actions (deactivation, deletion).
     * - For local users (with password): verifies the password
     * - For OAuth users (no password): verifies that confirmEmail matches user's email
     * 
     * @param user The user to verify
     * @param password Password provided by the user (for local users)
     * @param confirmEmail Email confirmation provided by the user (for OAuth users)
     * @throws IllegalArgumentException if verification fails
     */
    private void verifyUserIdentity(User user, String password, String confirmEmail) {
        boolean hasPassword = user.getPassword() != null && !user.getPassword().isEmpty();
        
        if (hasPassword) {
            // Local user: verify password
            if (password == null || password.isEmpty()) {
                throw new IllegalArgumentException("Password is required to perform this action");
            }
            if (!passwordEncoder.matches(password, user.getPassword())) {
                throw new IllegalArgumentException("Invalid password");
            }
        } else {
            // OAuth user: verify email confirmation
            if (confirmEmail == null || confirmEmail.isEmpty()) {
                throw new IllegalArgumentException("Email confirmation is required to perform this action");
            }
            if (!user.getEmail().equalsIgnoreCase(confirmEmail)) {
                throw new IllegalArgumentException("Email confirmation does not match your account email");
            }
        }
    }

    // --- Update Account ---

    @Transactional
    public ApiResponse updateAccount(String currentEmail, UpdateAccountRequest request) {
        // Find user by current email
        User user = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // No password verification required for username updates
        // User is already authenticated via JWT, which is sufficient proof of identity

        boolean emailChanged = !user.getEmail().equals(request.getEmail());
        boolean usernameChanged = !user.getUsername().equals(request.getUsername());

        // Check if username is being changed and if it's already taken
        if (usernameChanged && userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username is already taken");
        }

        // Check if email is being changed and if it's already taken
        if (emailChanged && userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already registered");
        }

        // Update username if changed
        if (usernameChanged) {
            user.setUsername(request.getUsername());
        }

        // Update email if changed
        if (emailChanged) {
            user.setEmail(request.getEmail());
            user.setEmailVerified(false);

            // Generate new verification token
            String emailToken = UUID.randomUUID().toString();
            user.setEmailVerificationToken(emailToken);
            user.setEmailVerificationExpiration(LocalDateTime.now().plusHours(verificationExpirationHours));

            userRepository.save(user);

            // Send verification email
            String verificationLink = verificationBaseUrl + emailToken;
            try {
                emailService.sendHtmlEmail(emailFrom, user.getEmail(), "Verify your iBudget account",
                        verificationLink,
                        user.getUsername());
            } catch (MessagingException | IOException e) {
                throw new RuntimeException("Failed to send verification email");
            }

            return new ApiResponse(true,
                    "Account updated successfully. Please verify your new email address.");
        }

        userRepository.save(user);
        return new ApiResponse(true, "Account updated successfully");
    }

}