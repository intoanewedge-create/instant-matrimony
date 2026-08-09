# InstantMatrimony V2 Enterprise - Environment Variables Guide

This document details all environment variables defined in the system and validated at startup using Zod in `src/config/env.ts`.

## Core Configuration
| Variable | Description | Default | Required |
| --- | --- | --- | --- |
| `DATABASE_URL` | PostgreSQL connection string. | N/A | Yes |
| `NODE_ENV` | Environment stage: `development`, `test`, or `production`. | `development` | No |
| `PORT` | Listening port for the application server. | `3000` | No |

## Authentication (NextAuth v5)
| Variable | Description | Default | Required |
| --- | --- | --- | --- |
| `AUTH_SECRET` | Secret key used for signing cookies and tokens. Minimum 8 characters (ideally 32+). | N/A | Yes |
| `NEXTAUTH_URL` | Canonical URL of the application. | `http://localhost:3000` | No |

## Telemetry & Diagnostics
| Variable | Description | Default | Required |
| --- | --- | --- | --- |
| `LOG_LEVEL` | Logging verbosity: `fatal`, `error`, `warn`, `info`, `debug`, `trace`. | `info` | No |

## Cache Provider
| Variable | Description | Default | Required |
| --- | --- | --- | --- |
| `CACHE_PROVIDER` | Selection: `memory` or `redis`. | `memory` | No |
| `REDIS_URL` | Connection URL for Redis instances (e.g. `redis://localhost:6379`). | N/A | Required if provider is `redis` |

## Storage Provider
| Variable | Description | Default | Required |
| --- | --- | --- | --- |
| `STORAGE_PROVIDER` | Selection: `local`, `s3`, `cloudinary`, `r2`, `minio`, or `mock`. | `local` | No |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary Cloud Name. | N/A | Required if provider is `cloudinary` |
| `CLOUDINARY_API_KEY` | Cloudinary API Key. | N/A | Required if provider is `cloudinary` |
| `CLOUDINARY_API_SECRET`| Cloudinary API Secret. | N/A | Required if provider is `cloudinary` |

## Email Provider
| Variable | Description | Default | Required |
| --- | --- | --- | --- |
| `EMAIL_PROVIDER` | Selection: `mock`, `smtp`, or `resend`. | `mock` | No |
| `SMTP_HOST` | SMTP server host. | N/A | Required if provider is `smtp` |
| `SMTP_PORT` | SMTP server port. | N/A | Required if provider is `smtp` |
| `SMTP_USER` | SMTP username. | N/A | Required if provider is `smtp` |
| `SMTP_PASS` | SMTP password. | N/A | Required if provider is `smtp` |
| `RESEND_API_KEY` | Resend API auth token. | N/A | Required if provider is `resend` |

## SMS Provider
| Variable | Description | Default | Required |
| --- | --- | --- | --- |
| `SMS_PROVIDER` | Selection: `mock`, `twilio`. | `mock` | No |
| `TWILIO_ACCOUNT_SID` | Twilio client SID. | N/A | Required if provider is `twilio` |
| `TWILIO_AUTH_TOKEN` | Twilio client Auth Token. | N/A | Required if provider is `twilio` |
| `TWILIO_FROM_NUMBER` | Twilio phone number. | N/A | Required if provider is `twilio` |

## Realtime Provider
| Variable | Description | Default | Required |
| --- | --- | --- | --- |
| `REALTIME_PROVIDER` | Selection: `socketio`, `supabase`, `pusher`, or `mock`. | `mock` | No |

## Payment Gateways
| Variable | Description | Default | Required |
| --- | --- | --- | --- |
| `PAYMENT_PROVIDER` | Selection: `stripe`, `razorpay`, or `mock`. | `mock` | No |
| `STRIPE_SECRET_KEY` | Stripe Secret Key. | N/A | Required if provider is `stripe` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret (HMAC verification). | N/A | Required if provider is `stripe` |
| `RAZORPAY_KEY_ID` | Razorpay Key ID. | N/A | Required if provider is `razorpay` |
| `RAZORPAY_KEY_SECRET` | Razorpay Secret. | N/A | Required if provider is `razorpay` |
| `RAZORPAY_WEBHOOK_SECRET`| Razorpay webhook signature secret. | N/A | Required if provider is `razorpay` |
