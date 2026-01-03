# E2E Test Matrix: Email Verification

> Test suite for email verification and resend verification functionality in iBudget

**Production URL**: `https://i-budget.site`  
**Routes**: 
- `/email-verified` - Email verification confirmation page
- `/resend-verification` - Resend verification email success page
- `/setup-account` - Account setup after registration  
**Last Updated**: December 23, 2025  
**Test Count**: 12

---

## Overview

This test matrix covers the email verification flow including clicking verification links, handling valid/invalid tokens, resending verification emails, and the account setup process after registration. Email verification is required before users can fully access the application.

### User Flow

1. User registers new account
2. System sends verification email with link
3. User clicks verification link
4. System verifies token and activates account
5. User sees `/email-verified` confirmation page
6. User clicks to proceed to login
7. (Alternative) User can request resend via `/resend-verification`

---

## Test Matrix

| Test ID | Test Name | Description | Preconditions | Steps | Expected Result | Priority | Type | Status | Last Tested | Notes |
|---------|-----------|-------------|---------------|-------|-----------------|----------|------|--------|-------------|-------|
| AUTH-VER-001 | Email verification link success | Verify email verification with valid token | New user with unverified email | 1. Click verification link from email<br>2. Wait for page load | Navigates to `/email-verified`, shows success message with checkmark icon | P0 | E2E | ✅ Passed | Dec 23, 2025 | Tested with kaelvxd@proton.me - Email verified successfully |
| AUTH-VER-002 | Display verification success page | Verify success page displays correctly | Valid verification completed | 1. Navigate to `/email-verified` (after successful verification) | Page displays: Checkmark icon, "Email Verified!" heading, welcome message, "Proceed to Login" button | P0 | Smoke | ✅ Passed | Dec 23, 2025 | User confirmed email verification completed |
| AUTH-VER-003 | Proceed to login after verification | Verify navigation to login after verification | On email verified page | 1. Click "Proceed to Login" button or card container | Navigates to `/auth-page` | P1 | E2E | ✅ Passed | Dec 23, 2025 | User successfully logged in after verification |
| AUTH-VER-004 | Invalid verification token | Verify error handling for invalid token | Invalid/malformed token in URL | 1. Navigate to verification URL with invalid token | Error page displayed indicating invalid verification link | P0 | Negative | ✅ Passed | Jan 3, 2026 | Email verification working correctly - manually verified |
| AUTH-VER-005 | Expired verification token | Verify error handling for expired token | Token older than expiry period | 1. Click expired verification link | Error page displayed, option to resend verification email | P1 | Negative | ✅ Passed | Jan 3, 2026 | Email verification working correctly - manually verified |
| AUTH-VER-006 | Already verified account | Verify behavior when clicking link for verified account | User already verified email | 1. Click verification link again | Appropriate message indicating already verified, redirect to login | P2 | E2E | ✅ Passed | Jan 3, 2026 | Email verification working correctly - manually verified |
| AUTH-VER-007 | Resend verification email success | Verify resend verification email flow | Unverified user account | 1. Request resend verification email<br>2. Wait for confirmation | Shows `/resend-verification` page with success message | P1 | E2E | ✅ Passed | Jan 3, 2026 | Email verification working correctly - manually verified |
| AUTH-VER-008 | Display resend verification success | Verify resend success page displays correctly | After requesting resend | 1. Navigate to `/resend-verification` | Page displays: Send checkmark icon, "Resend Email Verification Success" heading, instruction to check email | P1 | Smoke | ✅ Passed | Jan 3, 2026 | Email verification working correctly - manually verified |
| AUTH-VER-009 | Setup account page display | Verify setup account page shows after registration | New user just registered | 1. Complete registration<br>2. Observe redirect | Navigates to `/setup-account` for additional setup | P2 | E2E | ✅ Passed | Jan 3, 2026 | Email verification working correctly - manually verified |
| AUTH-VER-010 | Verification email content | Verify email contains correct verification link | User just registered | 1. Register new account<br>2. Check email inbox<br>3. Verify link format | Email contains valid link to `https://i-budget.site/...` with token | P1 | E2E | ✅ Passed | Jan 3, 2026 | Email verification working correctly - manually verified |
| AUTH-VER-011 | Multiple resend attempts | Verify user can request multiple verification emails | Unverified account | 1. Request resend verification<br>2. Wait<br>3. Request resend again | Each request sends new verification email | P2 | Regression | ✅ Passed | Jan 3, 2026 | Email verification working correctly - manually verified |
| AUTH-VER-012 | Verification link one-time use | Verify verification link cannot be reused | Valid token already used | 1. Click verification link (first time - success)<br>2. Click same link again | Second attempt shows already verified or invalid | P1 | Boundary | ✅ Passed | Jan 3, 2026 | Email verification working correctly - manually verified |

---

## Page Elements Reference

### Email Verified Page (`/email-verified`)

| Element | Selector | Type | Description |
|---------|----------|------|-------------|
| Container Card | `.card-container` | div | Clickable, routes to auth-page |
| Success Icon | `.bi-envelope-check-fill` | icon | Green checkmark envelope |
| Title | `h6.text-black` | heading | "Email Verified!" |
| Welcome Message | `p.text-secondary` | paragraph | Welcome and next steps |
| Proceed Button | `.btn-primary` | button | "Proceed to Login" |

### Resend Verification Page (`/resend-verification`)

| Element | Selector | Type | Description |
|---------|----------|------|-------------|
| Card Container | `.resend-card` | div | Main card wrapper |
| Success Icon | `.bi-send-check-fill` | icon | Send success icon |
| Title | `.card-title` | heading | "Resend Email Verification Success" |
| Message | `.card-message` | paragraph | "Please check your email..." |

### Setup Account Page (`/setup-account`)

| Element | Description | Purpose |
|---------|-------------|---------|
| Setup Form | Account configuration form | Initial user preferences |
| Profile Fields | User profile information | Complete account setup |
| Continue Button | Proceed after setup | Navigate to dashboard |

### Messages

| Page | Message Type | Content |
|------|--------------|---------|
| Email Verified | Success | "Email Verified!", "Welcome to iBudget" |
| Resend Verification | Success | "Resend Email Verification Success" |
| Error | Error | Token invalid/expired message |

---

## Test Data Requirements

### Verification Tokens

| Token Type | Description | Expected Behavior |
|------------|-------------|-------------------|
| Valid Token | Recently generated, unused | Successful verification |
| Expired Token | Generated > 24 hours ago | Expiry error |
| Used Token | Already used for verification | Already verified message |
| Invalid Token | Random/malformed string | Invalid link error |
| Missing Token | No token in URL | Error or redirect |

### Test Accounts

| Account Type | Email | Status | Use Case |
|--------------|-------|--------|----------|
| Unverified | `unverified_<timestamp>@test.com` | Email not verified | Test verification flow |
| Verified | `verified@test.com` | Email verified | Test already verified scenario |
| Fresh Registration | `new_<timestamp>@test.com` | Just registered | Test full flow |

### Email Testing

| Requirement | Details |
|-------------|---------|
| Email Provider | Access to receive test emails |
| Verification Link | Contains token parameter |
| Link Domain | `https://i-budget.site` |
| Email Subject | "Verify your iBudget account" (or similar) |

---

## Verification Flow Diagram

```
┌─────────────────┐
│  User Registers │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Verification    │
│ Email Sent      │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌───────┐  ┌──────────────┐
│ Click │  │ Resend Email │
│ Link  │  │ Request      │
└───┬───┘  └──────┬───────┘
    │             │
    ▼             ▼
┌────────┐  ┌─────────────────┐
│ Valid? │  │ /resend-        │
└───┬────┘  │ verification    │
    │       └─────────────────┘
┌───┴───┐
│       │
▼       ▼
Yes     No
│       │
▼       ▼
┌───────────────┐  ┌─────────────┐
│ /email-       │  │ Error Page  │
│ verified      │  │ (Expired/   │
└───────┬───────┘  │ Invalid)    │
        │          └─────────────┘
        ▼
┌───────────────┐
│ /auth-page    │
│ (Login)       │
└───────────────┘
```

---

## Coverage Summary

| Priority | Count | Percentage |
|----------|-------|------------|
| P0 (Critical) | 3 | 25% |
| P1 (High) | 5 | 42% |
| P2 (Medium) | 3 | 25% |
| P3 (Low) | 0 | 0% |
| **Total** | **12** | **100%** |

| Type | Count |
|------|-------|
| Smoke | 2 |
| E2E | 6 |
| Negative | 2 |
| Regression | 1 |
| Boundary | 1 |

---

## Related Test Files

- [Registration Tests](./registration.md) - User signup flow
- [Login Tests](./login.md) - User authentication
- [Password Recovery](./password-recovery.md) - Reset password flow
