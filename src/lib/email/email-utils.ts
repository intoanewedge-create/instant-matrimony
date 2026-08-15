/**
 * Safely extracts the recipient domain from an email address for diagnostic logging.
 * Returns ONLY the domain part (e.g., "gmail.com") and NEVER logs the full email
 * or personal identifiable information.
 */
export function getRecipientDomain(email: string): string {
  if (!email || typeof email !== "string") return "unknown";
  const atIndex = email.lastIndexOf("@");
  if (atIndex === -1 || atIndex === email.length - 1) return "unknown";
  return email.slice(atIndex + 1).trim().toLowerCase();
}
