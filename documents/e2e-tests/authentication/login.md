# E2E Test Matrix: User Login

> Test suite for user login/authentication functionality in iBudget

**Production URL**: `https://i-budget.site`  
**Route**: `/auth-page` (Login tab)  
**Last Updated**: December 2024  
**Test Count**: 14

---

## Overview

This test matrix covers the complete user login flow including form validation, authentication, error handling, and successful dashboard redirection. The login form is accessed via the "Login" tab on the `/auth-page` combined authentication page.

### User Flow

1. User navigates to `/auth-page`
2. User is on "Login" tab (default active)
3. User enters email and password
4. User submits form
5. System authenticates credentials
6. User redirected to dashboard on success

---

## Test Matrix

| Test ID | Test Name | Description | Preconditions | Steps | Expected Result | Priority | Type | Status | Last Tested | Notes |
|---------|-----------|-------------|---------------|-------|-----------------|----------|------|--------|-------------|-------|
| AUTH-LOG-001 | Display login form correctly | Verify login form displays all required fields | User not logged in | 1. Navigate to `https://i-budget.site/auth-page` | Form displays: Email field, Password field, Login button, Forgot Password link | P0 | Smoke | ⏳ Pending | - | Default tab is Login |
| AUTH-LOG-002 | Valid login with correct credentials | Complete successful login with valid credentials | Registered user with verified email | 1. Navigate to `/auth-page`<br>2. Enter valid email<br>3. Enter correct password<br>4. Click "Login" | User logged in, redirected to dashboard | P0 | E2E | ⏳ Pending | - | Core happy path |
| AUTH-LOG-003 | Invalid email format | Verify email validation for incorrect format | On login form | 1. Enter invalid email (e.g., "test@")<br>2. Move focus to password field | Error: "Please enter a valid email" | P1 | Negative | ⏳ Pending | - | - |
| AUTH-LOG-004 | Email required validation | Verify email field is required | On login form | 1. Leave email empty<br>2. Touch field and move focus | Error: "Email is required" | P1 | Negative | ⏳ Pending | - | - |
| AUTH-LOG-005 | Password required validation | Verify password field is required | On login form | 1. Leave password empty<br>2. Touch field and move focus | Error: "Password is required" | P1 | Negative | ⏳ Pending | - | - |
| AUTH-LOG-006 | Invalid credentials error | Verify error message for wrong password | Registered user exists | 1. Enter valid email<br>2. Enter incorrect password<br>3. Click "Login" | Error alert displayed with authentication failure message | P0 | Negative | ⏳ Pending | - | Should not reveal if email exists |
| AUTH-LOG-007 | Non-existent user login attempt | Verify error for unregistered email | Email not in system | 1. Enter non-existent email<br>2. Enter any password<br>3. Click "Login" | Error alert displayed (generic auth error) | P1 | Negative | ⏳ Pending | - | Same error as invalid password for security |
| AUTH-LOG-008 | Password visibility toggle | Verify password can be shown/hidden | On login form with password entered | 1. Enter password<br>2. Click eye icon toggle | Password text visibility toggles between hidden and visible | P2 | Regression | ⏳ Pending | - | Icon changes bi-eye/bi-eye-slash |
| AUTH-LOG-009 | Navigate to register tab | Verify user can switch to registration form | On login form | 1. Click "Register" tab in header | Registration form is displayed | P1 | Smoke | ⏳ Pending | - | Tab toggle functionality |
| AUTH-LOG-010 | Forgot password link navigation | Verify forgot password link works | On login form | 1. Click "Forgot Password?" link | Navigates to `/forgot-password` page | P1 | Smoke | ⏳ Pending | - | Link at bottom of form |
| AUTH-LOG-011 | Loading state during login | Verify loading indicator during authentication | Valid credentials entered | 1. Enter valid credentials<br>2. Click "Login" | Button shows spinner with "Loading..." text | P2 | Regression | ⏳ Pending | - | Prevents double submission |
| AUTH-LOG-012 | Submit button disabled during loading | Verify button disabled while authenticating | Login in progress | 1. Submit login form | Button is disabled during API call | P2 | Regression | ⏳ Pending | - | [disabled]="isSubmitting()" |
| AUTH-LOG-013 | Unverified email login attempt | Verify error for unverified email account | User registered but email not verified | 1. Enter email of unverified account<br>2. Enter correct password<br>3. Click "Login" | Error message indicating email verification required | P1 | Negative | ⏳ Pending | - | Should prompt to verify or resend |
| AUTH-LOG-014 | Session persistence after login | Verify user stays logged in after page refresh | Successfully logged in | 1. Login successfully<br>2. Refresh the page | User remains logged in, dashboard displayed | P1 | E2E | ⏳ Pending | - | JWT token persistence |

---

## Page Elements Reference

### Form Fields

| Element | Selector | Type | Validation Rules |
|---------|----------|------|------------------|
| Email | `#email` | email input | Required, valid email format |
| Password | `#password` | password input | Required |
| Login Button | `.login-button` | button | Disabled during submission |
| Password Toggle | `.btn-outline-secondary` | button | Toggles password visibility |

### Navigation Elements

| Element | Description | Target |
|---------|-------------|--------|
| Register Tab | Switch to registration form | Same page, register view |
| Forgot Password Link | Navigate to password recovery | `/forgot-password` |
| iBudget Logo | Navigate to landing page | `/` |

### Messages

| Type | CSS Class | Purpose |
|------|-----------|---------|
| Error Alert | `.alert-danger` | Authentication or server error |
| Field Error | `.text-danger.small` | Individual field validation |

### Loading States

| State | Visual Indicator |
|-------|-----------------|
| Submitting | Spinner + "Loading..." text |
| Idle | "Login" text |

---

## Test Data Requirements

### Valid Test Data

| Field | Value | Notes |
|-------|-------|-------|
| Email | `verified@example.com` | Pre-existing verified user |
| Password | `CorrectPass123!` | Matching password for user |

### Invalid Test Data

| Scenario | Email | Password | Expected Error |
|----------|-------|----------|----------------|
| Invalid email format | `notvalid` | any | Email format error |
| Empty email | (empty) | any | Email required |
| Empty password | valid | (empty) | Password required |
| Wrong password | `valid@email.com` | `WrongPass123` | Auth error |
| Non-existent email | `nouser@test.com` | any | Auth error |
| Unverified email | `unverified@test.com` | correct | Verification required |

### Pre-requisite Test Accounts

| Account Type | Email | Password | Status |
|--------------|-------|----------|--------|
| Verified User | `test_verified@example.com` | `TestPass123!` | Email verified |
| Unverified User | `test_unverified@example.com` | `TestPass123!` | Email not verified |

---

## Coverage Summary

| Priority | Count | Percentage |
|----------|-------|------------|
| P0 (Critical) | 2 | 14% |
| P1 (High) | 7 | 50% |
| P2 (Medium) | 5 | 36% |
| P3 (Low) | 0 | 0% |
| **Total** | **14** | **100%** |

| Type | Count |
|------|-------|
| Smoke | 3 |
| E2E | 2 |
| Negative | 5 |
| Regression | 4 |
| Boundary | 0 |
