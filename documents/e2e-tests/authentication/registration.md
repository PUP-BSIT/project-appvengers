# E2E Test Matrix: User Registration

> Test suite for user registration/sign-up functionality in iBudget

**Production URL**: `https://i-budget.site`  
**Route**: `/auth-page` (Register tab)  
**Last Updated**: December 23, 2024  
**Test Count**: 15

---

## Overview

This test matrix covers the complete user registration flow including form validation, field requirements, duplicate checking, and success scenarios. The registration form is accessed via the "Register" tab on the `/auth-page` combined authentication page.

### User Flow

1. User navigates to `/auth-page`
2. User clicks "Register" tab (if not already active)
3. User fills in registration form (username, email, password, confirm password)
4. User submits form
5. System validates and creates account
6. User receives verification email
7. Success message displayed

---

## Test Matrix

| Test ID | Test Name | Description | Preconditions | Steps | Expected Result | Priority | Type | Status | Last Tested | Notes |
|---------|-----------|-------------|---------------|-------|-----------------|----------|------|--------|-------------|-------|
| AUTH-REG-001 | Display signup form correctly | Verify registration form displays all required fields | User not logged in | 1. Navigate to `https://i-budget.site/auth-page`<br>2. Click "Register" tab | Form displays: Username, Email, Password, Confirm Password fields, Create Account button | P0 | Smoke | ✅ Passed | Dec 23, 2024 | All fields displayed correctly with placeholders |
| AUTH-REG-002 | Valid registration with all fields | Complete successful registration with valid data | User not logged in, unique email/username | 1. Navigate to `/auth-page`<br>2. Click "Register" tab<br>3. Enter unique username (12+ chars)<br>4. Enter valid unique email<br>5. Enter valid password (12+ chars)<br>6. Confirm password<br>7. Click "Create Account" | Success message displayed, verification email sent | P0 | E2E | ✅ Passed | Dec 23, 2024 | Tested with kaelvxd@proton.me - Success message: "Signup successful, Please check your email." |
| AUTH-REG-003 | Username minimum length validation | Verify username requires minimum 12 characters | On registration form | 1. Enter username with 11 characters<br>2. Move focus to next field | Error: "Username must be at least 12 characters" | P1 | Negative | ⏳ Pending | - | Min length is 12 chars per component |
| AUTH-REG-004 | Username required validation | Verify username field is required | On registration form | 1. Leave username empty<br>2. Touch field and move focus | Error: "Username is required" | P1 | Negative | ⏳ Pending | - | - |
| AUTH-REG-005 | Username uniqueness check | Verify duplicate username is rejected | Existing user with same username | 1. Enter username that already exists<br>2. Move focus to next field | Error: "Username is already taken" | P0 | Negative | ⏳ Pending | - | Async validation on blur |
| AUTH-REG-006 | Email format validation | Verify email field validates format | On registration form | 1. Enter invalid email format (e.g., "test@")<br>2. Move focus to next field | Error: "Please enter a valid email" | P1 | Negative | ⏳ Pending | - | - |
| AUTH-REG-007 | Email required validation | Verify email field is required | On registration form | 1. Leave email empty<br>2. Touch field and move focus | Error: "Email is required" | P1 | Negative | ⏳ Pending | - | - |
| AUTH-REG-008 | Email uniqueness check | Verify duplicate email is rejected | Existing user with same email | 1. Enter email that already exists<br>2. Move focus to next field | Error: "Email is already registered" | P0 | Negative | ⏳ Pending | - | Async validation on blur |
| AUTH-REG-009 | Password minimum length validation | Verify password requires minimum 12 characters | On registration form | 1. Enter password with 11 characters<br>2. Move focus to next field | Error: "Password must be at least 12 characters" | P1 | Negative | ⏳ Pending | - | Min length is 12 chars per component |
| AUTH-REG-010 | Password required validation | Verify password field is required | On registration form | 1. Leave password empty<br>2. Touch field and move focus | Error: "Password is required" | P1 | Negative | ⏳ Pending | - | - |
| AUTH-REG-011 | Confirm password matching | Verify passwords must match | On registration form | 1. Enter password: "TestPassword123"<br>2. Enter confirm password: "DifferentPass123"<br>3. Submit form | Error: "Passwords do not match" | P0 | Negative | ⏳ Pending | - | Validated on form submit |
| AUTH-REG-012 | Password visibility toggle | Verify password can be shown/hidden | On registration form with password entered | 1. Enter password<br>2. Click eye icon toggle | Password text visibility toggles between hidden (dots) and visible (plain text) | P2 | Regression | ⏳ Pending | - | Toggle icon changes bi-eye/bi-eye-slash |
| AUTH-REG-013 | Navigate to login tab | Verify user can switch to login form | On registration form | 1. Click "Login" tab in header | Login form is displayed | P1 | Smoke | ✅ Passed | Dec 23, 2024 | Tab toggle works correctly |
| AUTH-REG-014 | Submit button disabled for invalid form | Verify submit button is disabled when form is invalid | On registration form | 1. Leave all fields empty or invalid | "Create Account" button is disabled | P2 | Regression | ✅ Passed | Dec 23, 2024 | Button was disabled until all fields valid |
| AUTH-REG-015 | Loading state during submission | Verify loading indicator during form submission | Valid form data entered | 1. Fill all fields with valid data<br>2. Click "Create Account" | Button shows "Creating Account..." with loading state | P2 | Regression | ⏳ Pending | - | Prevents double submission |

---

## Page Elements Reference

### Form Fields

| Element | Selector | Type | Validation Rules |
|---------|----------|------|------------------|
| Username | `#username` | text input | Required, min 12 chars, unique |
| Email | `#email` | email input | Required, valid format, unique |
| Password | `#password` | password input | Required, min 12 chars |
| Confirm Password | `#confirmPassword` | password input | Required, must match password |
| Create Account Button | `.login-button` | button | Disabled when form invalid |
| Password Toggle | `.btn-outline-secondary` | button | Toggles password visibility |

### Navigation Elements

| Element | Description | Target |
|---------|-------------|--------|
| Login Tab | Switch to login form | Same page, login view |
| iBudget Logo | Navigate to landing page | `/` |

### Messages

| Type | CSS Class | Purpose |
|------|-----------|---------|
| Success | `.alert-success` | Registration successful |
| Error | `.alert-danger` | Form or server error |
| Field Error | `.text-danger.small` | Individual field validation |

---

## Test Data Requirements

### Valid Test Data

| Field | Value | Notes |
|-------|-------|-------|
| Username | `testuser_<timestamp>` | Unique per test run, 12+ chars |
| Email | `test_<timestamp>@example.com` | Unique per test run |
| Password | `TestPassword123!` | 12+ characters |
| Confirm Password | `TestPassword123!` | Must match password |

### Invalid Test Data

| Scenario | Username | Email | Password |
|----------|----------|-------|----------|
| Short username | `short` | valid | valid |
| Invalid email | valid | `notanemail` | valid |
| Short password | valid | valid | `short` |
| Mismatched passwords | valid | valid | `Pass1` / `Pass2` |

### Duplicate Data (for uniqueness tests)

- Pre-existing username: `existinguser123`
- Pre-existing email: `existing@example.com`

---

## Coverage Summary

| Priority | Count | Percentage |
|----------|-------|------------|
| P0 (Critical) | 4 | 27% |
| P1 (High) | 6 | 40% |
| P2 (Medium) | 5 | 33% |
| P3 (Low) | 0 | 0% |
| **Total** | **15** | **100%** |

| Type | Count |
|------|-------|
| Smoke | 2 |
| E2E | 1 |
| Negative | 8 |
| Regression | 4 |
| Boundary | 0 |
