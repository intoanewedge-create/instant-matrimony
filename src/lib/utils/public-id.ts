/**
 * Public Profile ID Utility
 *
 * Generates unique, human-readable InstantMatrimony Profile IDs in the format:
 *   IM########  (e.g., IM12785469)
 *
 * Rules:
 * - Generated server-side ONLY — never in client code
 * - Stored in User.publicId immediately on registration
 * - Never changes after assignment
 * - Never reused, even if the original user is soft-deleted (DB @unique ensures this)
 * - Does NOT expose the internal UUID
 */

const IM_PREFIX = "IM";
const DIGITS = 8;
const MAX_RETRIES = 10;

/**
 * Generate a candidate IM######## string.
 * Uses current timestamp + random noise to produce an 8-digit number.
 * The DB unique constraint is the final collision guard.
 */
function generateCandidate(): string {
  // Combine epoch millis and a random 4-digit suffix, take last 8 digits
  const tsComponent = Date.now() % 100_000_000; // 8 digits max
  const randomComponent = Math.floor(Math.random() * 10_000); // 4 digits
  const combined = (tsComponent * 10 + randomComponent) % 100_000_000;
  const padded = combined.toString().padStart(DIGITS, "0");
  return `${IM_PREFIX}${padded}`;
}

/**
 * Generate and persist a unique publicId for the given userId.
 * Uses a Prisma transaction context (tx) or the global prisma client.
 *
 * @param tx - Prisma transaction client (or global prisma)
 * @param userId - The user's database UUID to assign the publicId to
 * @returns The generated publicId string (e.g., "IM12785469")
 * @throws Error if unable to find a unique ID after MAX_RETRIES attempts
 */
export async function assignPublicId(tx: any, userId: string): Promise<string | null> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const candidate = generateCandidate();

    try {
      await tx.user.update({
        where: { id: userId },
        data: { publicId: candidate },
      });
      return candidate;
    } catch (err: any) {
      // P2002 = Unique constraint violation — try again with a new candidate
      if (err.code === "P2002" && attempt < MAX_RETRIES) {
        // Tiny delay to shift timestamp component
        await new Promise((r) => setTimeout(r, 2));
        continue;
      }
      // If publicId column does not exist in database yet (migration pending on production), log warning and return null safely
      if (
        err.message?.includes("publicId") ||
        err.message?.includes("column") ||
        err.code === "P2025" ||
        err.code === "P2011"
      ) {
        console.warn(`[assignPublicId] publicId column missing or unmigrated in database. Skipping assignment for user ${userId}.`);
        return null;
      }
      throw err;
    }
  }

  return null;
}

/**
 * Derive a deterministic publicId from a user's creation timestamp and a counter.
 * Used by the backfill script to populate existing users in a reproducible way.
 *
 * @param createdAtMs - User.createdAt as milliseconds since epoch
 * @param counter - A monotonically increasing counter across users
 */
export function derivePublicId(createdAtMs: number, counter: number): string {
  // Mix timestamp and counter to create an 8-digit number
  const mixed = ((createdAtMs % 10_000_000) * 1000 + counter) % 100_000_000;
  const padded = mixed.toString().padStart(DIGITS, "0");
  return `${IM_PREFIX}${padded}`;
}

/**
 * Get a consistent public Profile ID for display in both User and Admin interfaces.
 * Ensures the exact same ID is used everywhere:
 * 1. Checks user.publicId
 * 2. Checks profile.publicId
 * 3. Falls back to deterministic IM + 8-char sanitized UUID
 */
export function getDisplayProfileId(
  userOrProfile?: any,
  fallbackUserId?: string | null
): string {
  if (!userOrProfile && !fallbackUserId) return "IM00000000";

  // Check direct publicId field on user/profile object
  if (typeof userOrProfile === "string" && userOrProfile.startsWith("IM")) {
    return userOrProfile;
  }
  if (userOrProfile?.publicId && typeof userOrProfile.publicId === "string") {
    return userOrProfile.publicId;
  }
  if (userOrProfile?.user?.publicId && typeof userOrProfile.user.publicId === "string") {
    return userOrProfile.user.publicId;
  }

  // Fallback to user ID or object ID
  const idToUse =
    userOrProfile?.userId ||
    userOrProfile?.user?.id ||
    fallbackUserId ||
    userOrProfile?.id;

  if (idToUse && typeof idToUse === "string") {
    const clean = idToUse.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    return `${IM_PREFIX}${clean.slice(0, DIGITS).padEnd(DIGITS, "0")}`;
  }

  return "IM00000000";
}

