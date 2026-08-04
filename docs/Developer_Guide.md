# InstantMatrimony V2 Enterprise - Developer Guide

## Core Architecture
- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript
- **ORM & DB**: Prisma ORM with PostgreSQL database schema
- **Dependency Injection**: `src/lib/container.ts` & modular services (`src/lib/services/`)
- **Server Actions**: `src/lib/actions/` handling UI interactions cleanly
- **Design System**: TailwindCSS + Radix UI + CSS dynamic custom properties
