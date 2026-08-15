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
export async function assignPublicId(tx: any, userId: string): Promise<string> {
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
      throw err;
    }
  }

  throw new Error(`Failed to assign unique publicId after ${MAX_RETRIES} attempts`);
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
