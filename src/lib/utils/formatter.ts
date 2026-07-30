export function formatIncome(income: number): string {
  if (income >= 10000000) return `${(income / 10000000).toFixed(1)} Crore`;
  if (income >= 100000) return `${(income / 100000).toFixed(1)} Lakh`;
  return `${income}`;
}
