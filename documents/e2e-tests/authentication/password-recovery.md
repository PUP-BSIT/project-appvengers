# E2E Test Matrix: Password Recovery

> Test suite for forgot password and reset password functionality in iBudget

**Production URL**: `https://i-budget.site`  
**Routes**: 
- `/forgot-password` - Request password reset
- `/reset-password` - Reset password with token  
**Last Updated**: December 2025  
**Test Count**: 15

---

## Overview

This test matrix covers the complete password recovery flow including requesting a reset link, email validation, token handling, and setting a new password. The flow spans two pages: forgot password request and password reset form.

### User Flow

1. User clicks "Forgot Password?" from login page
2. User enters email on `/forgot-password` page
3. User submits request
4. System sends reset email with token link
5. User clicks link, navigates to `/reset-password?token=xxx`
6. System validates token
7. User enters new password and confirms
8. User redirected to login on success

---

## Test Matrix

| Test ID | Test Name | Description | Preconditions | Steps | Expected Result | Priority | Type | Status | Last Tested | Notes |
|---------|-----------|-------------|---------------|-------|-----------------|----------|------|--------|-------------|-------|
| AUTH-PWR-001 | Display forgot password form | Verify forgot password page displays correctly | User not logged in | 1. Navigate to `https://i-budget.site/forgot-password` | Page displays: Logo, "Forgot Password?" title, email input, "Send Reset Link" button, "Back to Login" link | P0 | Smoke | ✅ Passed | Dec 23, 2025 | All elements present |
| AUTH-PWR-002 | Submit valid email for recovery | Request password reset with valid registered email | Registered user exists | 1. Navigate to `/forgot-password`<br>2. Enter registered email<br>3. Click "Send Reset Link" | Success: Shows "Check Your Email" message with confirmation | P0 | E2E | ✅ Passed | Dec 23, 2025 | Success message displayed |
| AUTH-PWR-003 | Email required validation | Verify email field is required | On forgot password form | 1. Leave email empty<br>2. Touch field and blur | Error: "Email is required" | P1 | Negative | ✅ Passed | Dec 23, 2025 | Error appears on blur |
| AUTH-PWR-004 | Invalid email format error | Verify email format validation | On forgot password form | 1. Enter invalid email (e.g., "test@")<br>2. Blur the field | Error: "Please enter a valid email address" | P1 | Negative | ✅ Passed | Dec 23, 2025 | Validates format correctly |
| AUTH-PWR-005 | Non-existent email handling | Verify behavior for unregistered email | Email not in system | 1. Enter non-existent email<br>2. Click "Send Reset Link" | For security, should show same success message or generic response | P1 | Negative | ✅ Passed | Dec 23, 2025 | Shows same success message (Security best practice) |
| AUTH-PWR-006 | Loading state during submission | Verify loading indicator while sending | Valid email entered | 1. Enter valid email<br>2. Click "Send Reset Link" | Button shows spinner with "Sending..." text | P2 | Regression | ✅ Passed | Dec 23, 2025 | Button text changes to "Sending..." |
| AUTH-PWR-007 | Send another link option | Verify user can request another reset link | After successful submission | 1. Complete successful reset request<br>2. Click "Send Another Link" | Form resets, user can submit another request | P2 | Regression | ✅ Passed | Dec 23, 2025 | Form resets correctly |
| AUTH-PWR-008 | Back to login navigation | Verify back to login link works | On forgot password page | 1. Click "Back to Login" link | Navigates to `/auth-page` | P2 | Smoke | ✅ Passed | Dec 23, 2025 | Navigation works |
| AUTH-PWR-009 | Display reset password form | Verify reset password page displays correctly | Valid token in URL | 1. Navigate to `/reset-password?token=valid_token` | Page displays: Logo, "Reset Password" title, new password input, confirm password input, "Reset Password" button | P0 | Smoke | ✅ Passed | Dec 23, 2025 | Form displayed. BUG: "Back to Login" link points to /login (404) |
| AUTH-PWR-010 | Valid password reset | Complete successful password reset | Valid token, form filled correctly | 1. Navigate to `/reset-password?token=valid`<br>2. Enter new password (8+ chars)<br>3. Confirm password<br>4. Click "Reset Password" | Success message displayed, auto-redirect to login | P0 | E2E | ✅ Passed | Dec 23, 2025 | Verified manually with valid token and subsequent login |
| AUTH-PWR-011 | Password minimum length validation | Verify new password requires minimum 8 characters | On reset password form | 1. Enter password with 7 characters<br>2. Blur field | Error: "Password must be at least 8 characters" | P1 | Negative | ✅ Passed | Dec 23, 2025 | Error appears correctly |
| AUTH-PWR-012 | Password mismatch validation | Verify passwords must match | On reset password form | 1. Enter new password<br>2. Enter different confirm password<br>3. Submit form | Error: "Passwords do not match" | P1 | Negative | ✅ Passed | Dec 23, 2025 | Error appears correctly |
| AUTH-PWR-013 | Invalid token error | Verify error for invalid/malformed token | Invalid token in URL | 1. Navigate to `/reset-password?token=invalid123` | Error: "Invalid or Expired Link" with option to request new link | P0 | Negative | ✅ Passed | Dec 23, 2025 | Shows error. BUG: "Back to Login" link points to /login (404) |
| AUTH-PWR-014 | Expired token handling | Verify error for expired token | Token older than expiry time | 1. Navigate to `/reset-password?token=expired_token` | Error: "Invalid or Expired Link" message, "Request New Reset Link" button | P1 | Negative | ✅ Passed | Dec 23, 2025 | Shows invalid token error |
| AUTH-PWR-015 | Password visibility toggle on reset | Verify password visibility toggle works | On reset password form | 1. Enter new password<br>2. Click eye icon toggle | Password visibility toggles for both fields | P2 | Regression | ✅ Passed | Dec 23, 2025 | Toggle works correctly |

---

## Page Elements Reference

### Forgot Password Page (`/forgot-password`)

| Element | Selector | Type | Validation Rules |
|---------|----------|------|------------------|
| Email | `#email` | email input | Required, valid email format |
| Send Reset Link Button | `.btn-primary` | button | Disabled when form invalid or loading |
| Back to Login Link | `a[routerLink="/auth-page"]` | link | Navigates to auth page |
| Error Alert | `.alert-danger` | div | Server error display |

### Reset Password Page (`/reset-password`)

| Element | Selector | Type | Validation Rules |
|---------|----------|------|------------------|
| New Password | `#newPassword` | password input | Required, min 8 characters |
| Confirm Password | `#confirmPassword` | password input | Required, must match new password |
| Reset Password Button | `.btn-primary` | button | Disabled when form invalid |
| Password Toggle (New) | Button next to new password | button | Toggles visibility |
| Password Toggle (Confirm) | Button next to confirm | button | Toggles visibility |
| Request New Link Button | `a[routerLink="/forgot-password"]` | link | Shows on token error |

### Success States

| Page | Success Indicator |
|------|-------------------|
| Forgot Password | Green checkmark icon, "Check Your Email" heading |
| Reset Password | Green checkmark icon, "Password Reset Successful!" heading |

### Error States

| Page | Error Indicator |
|------|-----------------|
| Forgot Password | Red alert box with error message |
| Reset Password | Red X icon, "Invalid or Expired Link" heading |

---

## Test Data Requirements

### Forgot Password Test Data

| Scenario | Email | Expected Result |
|----------|-------|-----------------|
| Registered user | `registered@example.com` | Success message |
| Unregistered email | `notexist@example.com` | Same success (security) |
| Invalid format | `notanemail` | Validation error |

### Reset Password Test Data

| Scenario | Token | New Password | Expected Result |
|----------|-------|--------------|-----------------|
| Valid reset | `valid_token_xxx` | `NewSecurePass123!` | Success |
| Invalid token | `invalid123` | any | Token error |
| Expired token | `expired_token_xxx` | any | Token error |
| Short password | valid | `Short1` | Length error |
| Mismatch passwords | valid | `Pass1` / `Pass2` | Mismatch error |

### Token Requirements

| Type | Description | Validity |
|------|-------------|----------|
| Valid Token | Recently generated, unused | ~24 hours |
| Expired Token | Generated > 24 hours ago | Invalid |
| Used Token | Already used for reset | Invalid |
| Invalid Token | Random/malformed string | Invalid |

---

## Coverage Summary

| Priority | Count | Percentage |
|----------|-------|------------|
| P0 (Critical) | 5 | 33% |
| P1 (High) | 5 | 33% |
| P2 (Medium) | 5 | 34% |
| P3 (Low) | 0 | 0% |
| **Total** | **15** | **100%** |

| Type | Count |
|------|-------|
| Smoke | 3 |
| E2E | 2 |
| Negative | 7 |
| Regression | 3 |
| Boundary | 0 |
