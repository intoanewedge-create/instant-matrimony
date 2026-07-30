# Security Implementation Guide

This document describes the security controls configured on the InstantMatrimony Enterprise platform.

## 1. Content Security Policy (CSP) & HTTP Headers

HTTP response security headers are defined inside `next.config.ts`.
- **Content-Security-Policy:** Strictly configures resource domains:
  - Allowed scripts: self, Stripe checkout (`https://js.stripe.com`), and Razorpay checkout (`https://checkout.razorpay.com`).
  - Allowed images: self, S3 bucket storage, and Cloudinary media domains.
  - Form Actions: restricted to self.
- **Strict-Transport-Security (HSTS):** Enforced with `max-age=63072000; includeSubDomains; preload`.
- **X-Frame-Options:** Set to `DENY` to protect against Clickjacking.
- **X-Content-Type-Options:** Set to `nosniff` to protect against MIME type sniffing.

## 2. Sliding Window Rate Limiting

The sliding window rate limiter is handled by `RateLimitService` using `CacheProvider`. It keeps an array of timestamps per client key and filters out old timestamps.

Per-endpoint configurations:
- **Login:** Max 5 requests per 60 seconds.
- **Registration:** Max 3 requests per 300 seconds.
- **OTP:** Max 3 requests per 60 seconds.
- **Password Reset:** Max 3 requests per 300 seconds.
- **Search:** Max 30 requests per 60 seconds.
- **Chat:** Max 60 requests per 60 seconds.
- **Payments:** Max 10 requests per 60 seconds.
- **Admin:** Max 100 requests per 60 seconds.

## 3. Double-Submit Cookie CSRF Protection

The `CsrfService` implements Double-Submit Cookie validation:
1. When generating a token, the service creates a random cryptographic salt.
2. A cookie containing the raw salt is injected.
3. The matching signed token is sent in custom headers or form payload.
4. The service signs the cookie salt with the server secret and verifies a matches signature.

## 4. Password History and Complexity

Password policies are managed by the `SecurityService`:
- Enforces complexity matching: At least 8 characters, 1 lowercase, 1 uppercase, 1 number, and 1 special symbol.
- Prevents password reuse by matching the new password against the last 5 hashes stored in the `PasswordHistory` model.
- Automatically updates `lastPasswordChangedAt` and logs a password change audit log inside a single database transaction.
