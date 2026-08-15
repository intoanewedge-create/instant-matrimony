/**
 * Backfill Script: Assign publicId to all existing users without one.
 *
 * SAFE USAGE:
 *   npx tsx scripts/backfill-public-ids.ts
 *
 * This script:
 *   1. Fetches all users where publicId IS NULL
 *   2. Generates a unique IM######## for each
 *   3. Persists each ID immediately (one at a time to prevent conflicts)
 *   4. Verifies zero NULL publicIds remain after completion
 *
 * Run AFTER deploying the migration SQL and BEFORE deploying app code.
 * Safe to re-run: skips users that already have a publicId.
 */

import { PrismaClient } from "@prisma/client";
import { derivePublicId } from "../src/lib/utils/public-id";

const prisma = new PrismaClient();

async function backfill() {
  console.log("=== InstantMatrimony — Public Profile ID Backfill ===\n");

  const users = await prisma.user.findMany({
    where: { publicId: null },
    select: { id: true, email: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  console.log(`Found ${users.length} user(s) without a publicId.\n`);

  if (users.length === 0) {
    console.log("✓ All users already have a publicId. Nothing to do.");
    return;
  }

  let successCount = 0;
  let failCount = 0;
  const usedIds = new Set<string>();

  // Seed the used set from existing publicIds to avoid collisions
  const existing = await prisma.user.findMany({
    where: { publicId: { not: null } },
    select: { publicId: true },
  });
  for (const u of existing) {
    if (u.publicId) usedIds.add(u.publicId);
  }

  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    let candidate = derivePublicId(user.createdAt.getTime(), i + 1);

    // Ensure uniqueness within this batch (DB constraint is final guard)
    let attempt = 0;
    while (usedIds.has(candidate) && attempt < 100) {
      attempt++;
      // Shift counter slightly to get a different ID
      candidate = derivePublicId(user.createdAt.getTime() + attempt * 7, i + 1 + attempt);
    }

    try {
      await prisma.user.update({
        where: { id: user.id },
        data: { publicId: candidate },
      });
      usedIds.add(candidate);
      successCount++;
      console.log(`✓ [${i + 1}/${users.length}] ${user.email} → ${candidate}`);
    } catch (err: any) {
      failCount++;
      console.error(`✗ [${i + 1}/${users.length}] ${user.email} → FAILED: ${err.message}`);
    }
  }

  console.log(`\n=== Backfill Complete ===`);
  console.log(`  Succeeded : ${successCount}`);
  console.log(`  Failed    : ${failCount}`);

  // Verification pass
  const nullCount = await prisma.user.count({ where: { publicId: null } });
  if (nullCount === 0) {
    console.log(`\n✅ Verification passed: Zero users with NULL publicId.`);
  } else {
    console.error(`\n❌ Verification FAILED: ${nullCount} user(s) still have NULL publicId!`);
    process.exit(1);
  }
}

backfill()
  .catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
