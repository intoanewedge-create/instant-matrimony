export function calculateAge(dob: Date | string | null | undefined): number {
  if (!dob) return 0;
  const dobDate = dob instanceof Date ? dob : new Date(dob);
  if (isNaN(dobDate.getTime())) return 0;
  const diffMs = Date.now() - dobDate.getTime();
  const ageDate = new Date(diffMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
