-- Migration: 20260815_add_user_public_id
-- Description: Add nullable publicId column to User table for human-readable IM######## Profile IDs.
--              This is an ADDITIVE-ONLY migration. No existing columns are altered or dropped.
--
-- SAFE DEPLOY SEQUENCE:
--   1. Run this migration on production (adds nullable column safely)
--   2. Run the backfill script (scripts/backfill-public-ids.ts) to populate existing users
--   3. Verify zero NULL publicId rows remain
--   4. Deploy application code that writes publicId on new registrations

-- Step 1: Add the nullable publicId column
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "publicId" TEXT;

-- Step 2: Create the unique index (deferred until after backfill if NULLs exist)
-- NOTE: PostgreSQL UNIQUE constraints allow multiple NULLs, so this is safe to create now.
CREATE UNIQUE INDEX IF NOT EXISTS "User_publicId_key" ON "User"("publicId");
