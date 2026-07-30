import { Membership, MembershipPlan, Order, Payment, Transaction } from "@prisma/client";

export interface IMembershipRepository {
  findActiveByUserId(userId: string): Promise<Membership | null>;
  findPlanById(planId: string): Promise<MembershipPlan | null>;
  findAllPlans(activeOnly?: boolean): Promise<MembershipPlan[]>;
  createPlan(data: any): Promise<MembershipPlan>;
  updatePlan(planId: string, data: any): Promise<MembershipPlan>;
  softDeletePlan(planId: string): Promise<MembershipPlan>;
  createMembershipTransaction(data: {
    userId: string;
    planId: string;
    amount: number;
    durationDays: number;
    gateway: string;
  }): Promise<{ order: Order; payment: Payment; membership: Membership; transaction: Transaction }>;
  findOrdersByUserId(userId: string, cursor?: string, limit?: number): Promise<Order[]>;
  findById(id: string): Promise<Membership | null>;
  update(id: string, data: any): Promise<Membership>;
}
