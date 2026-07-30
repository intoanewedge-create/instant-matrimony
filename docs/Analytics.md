# Business Intelligence & Cohort Analytics

The `/admin/analytics` workspace generates real-time telemetry metrics mapping user registration steps, communication densities, and premium account subscription retention.

## 1. Funnel Conversion Telemetry

The conversion funnel tracks three distinct onboarding milestones:
1. **Registration (STEP_1)**: User account successfully created (email/password).
2. **Profile Completion (STEP_2)**: Demographic metadata, photos, and partner preferences submitted.
3. **Identity Verification (STEP_3)**: Government document verified.

The conversion rates are calculated relative to registration volumes:
$$\text{Conversion Rate} = \left( \frac{\text{Step Count}}{\text{Total Registrations}} \right) \times 100\%$$

## 2. Cohort Retention Math

Cohort analytics segment users based on their registration week/month and track their subsequent weekly login activity:
- **Cohort Group**: Users who signed up during the same weekly period (Week 0).
- **Retention Weeks**: Ratio of users from a specific cohort who logged in at least once during Week $N$ compared to the initial Week 0 volume.

```
+-------------+----------+--------+--------+--------+--------+
| Cohort Name | Volume   | Week 0 | Week 1 | Week 2 | Week 3 |
+-------------+----------+--------+--------+--------+--------+
| Jul 01 - 07 | 1,200    | 100%   | 82%    | 71%    | 65%    |
| Jul 08 - 14 | 1,450    | 100%   | 80%    | 68%    | --     |
+-------------+----------+--------+--------+--------+--------+
```

## 3. Search and Verification Telemetry
Tracks system operations such as:
- Total searches executed.
- Profile verification workloads.
- Average system latency for media scans.
