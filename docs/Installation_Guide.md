# InstantMatrimony V2 Enterprise - Installation Guide

## System Requirements
- Node.js 20+ LTS
- PostgreSQL 15+ database
- Redis (optional for caching)

## Quick Start Installation
1. Extract or clone the codebase.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy environment configuration:
   ```bash
   cp .env.example .env
   ```
4. Run database migrations and client generation:
   ```bash
   npx prisma generate
   npx prisma db push
   ```
5. Start development server:
   ```bash
   npm run dev
   ```
6. Open browser at `http://localhost:3000/installer` to run the secure First-Run Setup Wizard.
