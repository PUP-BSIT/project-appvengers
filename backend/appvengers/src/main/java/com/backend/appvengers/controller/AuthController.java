package com.backend.appvengers.controller;

import com.backend.appvengers.dto.ApiResponse;
import com.backend.appvengers.dto.LoginRequest;
import com.backend.appvengers.dto.SignupRequest;
import com.backend.appvengers.dto.ForgotPasswordRequest;
import com.backend.appvengers.dto.ResetPasswordRequest;
import com.backend.appvengers.dto.ChangePasswordRequest;
import com.backend.appvengers.dto.ReactivateAccountRequest;
import com.backend.appvengers.security.LoginRateLimiter;
import com.backend.appvengers.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import io.github.bucket4j.Bucket;
import java.security.Principal;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final LoginRateLimiter loginRateLimiter;
    
    @Value("${app.frontend.url:http://i-budget.site}")
    private String frontendUrl;

    @PostMapping("/signup")
    public ResponseEntity<ApiResponse> registerUser(@Valid @RequestBody SignupRequest signupRequest,
                                                    BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            bindingResult.getFieldErrors().forEach(error ->
                errors.put(error.getField(), error.getDefaultMessage())
            );
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, "Validation failed", errors));
        }

        try {
            ApiResponse response = userService.registerUser(signupRequest);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse> login(@RequestBody @Valid LoginRequest request,
                                             HttpServletRequest httpRequest) {
        String clientKey = httpRequest.getRemoteAddr();
        Bucket bucket = loginRateLimiter.resolveBucket(clientKey);

        if (!bucket.tryConsume(1)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(new ApiResponse(false, "Too many login attempts. Please wait before retrying."));
        }

        ApiResponse response = userService.login(request);

        if (!response.isSuccess()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        return ResponseEntity.ok(response);
    }

    @PostMapping("/reactivate")
    public ResponseEntity<ApiResponse> reactivateAccount(
            @Valid @RequestBody ReactivateAccountRequest request,
            BindingResult bindingResult) {

        if (bindingResult.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            bindingResult.getFieldErrors().forEach(error ->
                errors.put(error.getField(), error.getDefaultMessage())
            );
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, "Validation failed", errors));
        }

        try {
            ApiResponse response = userService.reactivateAccount(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/check-username/{username}")
    public ResponseEntity<ApiResponse> checkUsername(@PathVariable String username) {
        boolean exists = userService.existsByUsername(username);
        return ResponseEntity.ok(new ApiResponse(true, "", Map.of("exists", exists)));
    }

    @GetMapping("/check-email/{email}")
    public ResponseEntity<ApiResponse> checkEmail(@PathVariable String email) {
        boolean exists = userService.existsByEmail(email);
        return ResponseEntity.ok(new ApiResponse(true, "", Map.of("exists", exists)));
    }

    // Verifies email using the token sent to user's email
    @SuppressWarnings("null") 
    @GetMapping("/verify-email")
    public ResponseEntity<ApiResponse> verifyEmail(@RequestParam("token") String token) {
        ApiResponse response = userService.verifyEmailToken(token);

        if (response.isSuccess()) {
            URI redirectUri = URI.create(frontendUrl + "/email-verified?token=" + token);
            return ResponseEntity.status(HttpStatus.FOUND)
                .location(redirectUri)
                .build();
        } else {
            // redirect the browser to a frontend page that shows a friendly error
            URI failRedirectUri = URI.create(frontendUrl + "/verify-failed");
            return ResponseEntity.status(HttpStatus.FOUND).location(failRedirectUri).build();
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request,
                                                       BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            bindingResult.getFieldErrors().forEach(error ->
                errors.put(error.getField(), error.getDefaultMessage())
            );
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, "Validation failed", errors));
        }

        try {
            ApiResponse response = userService.requestPasswordReset(request.getEmail());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/validate-reset-token")
    public ResponseEntity<ApiResponse> validateResetToken(@RequestParam("token") String token) {
        ApiResponse response = userService.validateResetToken(token);
        
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest request,
                                                      BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            bindingResult.getFieldErrors().forEach(error ->
                errors.put(error.getField(), error.getDefaultMessage())
            );
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, "Validation failed", errors));
        }

        try {
            ApiResponse response = userService.resetPassword(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse> changePassword(@Valid @RequestBody ChangePasswordRequest request,
                                                       BindingResult bindingResult,
                                                       Principal principal) {
        if (bindingResult.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            bindingResult.getFieldErrors().forEach(error ->
                errors.put(error.getField(), error.getDefaultMessage())
            );
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, "Validation failed", errors));
        }

        try {
            String username = principal.getName();
            ApiResponse response = userService.changePassword(username, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @SuppressWarnings("null") 
    @PostMapping("/resend-verification")
    public ResponseEntity<ApiResponse> resendVerification(@RequestParam("email") String email) {
        ApiResponse response = userService.resendVerificationEmail(email);
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            // redirect the browser to a frontend page that shows a friendly error
            URI failRedirectUri = URI.create(frontendUrl + "/resend-verification-failed");
            return ResponseEntity.status(HttpStatus.FOUND).location(failRedirectUri).build();
        }
    }
}