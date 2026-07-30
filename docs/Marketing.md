# Outbound Marketing & Promo Coupon Systems

The Marketing console (`/admin/marketing`) equips growth managers with campaign scheduling interfaces and promotional discount coupon configuration tools.

## 1. Outbound Campaigns

Campaigns represent message schedules dispatched to specific user target segments:
- **Channels**: Supports email newsletters, SMS alerts, push notifications, or custom landing pages.
- **Segments**: e.g., `ALL`, `PREMIUM`, `INACTIVE_30D` (users inactive for 30+ days).
- **Execution States**:
  - `DRAFT`: Local composition, editable.
  - `SCHEDULED`: Scheduled to run at a specific future date.
  - `ACTIVE`: Actively sending.
  - `COMPLETED`: Run complete; stores total clicks and message volume.

## 2. Promo Coupons

Coupons grant membership discount codes:
- **Redemption Rules**: Validates coupon codes during payment. Checks active dates, expiration limits, and maximum redemption thresholds before credit deduction.
- **Structure**:
  - `discountType`: PERCENTAGE (e.g. 20% off) or FIXED (e.g. $10 off).
  - `maxRedemptions`: Maximum times code can be redeemed across the system.
