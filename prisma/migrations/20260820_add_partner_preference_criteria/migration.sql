-- Migration: 20260820_add_partner_preference_criteria
-- Description: Add nullable caste, occupation, state, and city columns to PartnerPreference table.
--              This is an ADDITIVE-ONLY migration. No existing columns are altered or dropped.
--
-- SAFE DEPLOY SEQUENCE:
--   1. Run this migration on production (adds nullable columns safely without data loss)
--   2. Deploy application code supporting these partner preference filters and fields

-- Add the nullable criteria columns to PartnerPreference
ALTER TABLE "PartnerPreference" ADD COLUMN IF NOT EXISTS "caste" TEXT;
ALTER TABLE "PartnerPreference" ADD COLUMN IF NOT EXISTS "occupation" TEXT;
ALTER TABLE "PartnerPreference" ADD COLUMN IF NOT EXISTS "state" TEXT;
ALTER TABLE "PartnerPreference" ADD COLUMN IF NOT EXISTS "city" TEXT;
