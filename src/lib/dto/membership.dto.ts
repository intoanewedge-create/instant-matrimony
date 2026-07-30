export interface MembershipResponse {
  id: string;
  userId: string;
  planId: string;
  planName: string;
  price: number;
  status: string;
  startDate: string;
  endDate: string;
  remainingDays: number;
}
