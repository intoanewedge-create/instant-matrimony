import { Membership, MembershipPlan, Order, Payment, Transaction } from "@prisma/client";
import { prisma } from "../prisma";
import { IMembershipRepository } from "./interfaces/membership.repository";

export class PrismaMembershipRepository implements IMembershipRepository {
  protected modelDelegate = prisma.membership;

  async findActiveByUserId(userId: string): Promise<Membership | null> {
    return prisma.membership.findFirst({
      where: {
        userId,
        status: "ACTIVE",
        endDate: { gte: new Date() },
      },
      include: { plan: true },
    });
  }

  async findPlanById(planId: string): Promise<MembershipPlan | null> {
    return prisma.membershipPlan.findFirst({
      where: { id: planId, deletedAt: null },
    });
  }

  async findAllPlans(activeOnly?: boolean): Promise<MembershipPlan[]> {
    return prisma.membershipPlan.findMany({
      where: {
        deletedAt: null,
        ...(activeOnly ? { isActive: true } : {}),
      },
      orderBy: { price: "asc" },
    });
  }

  async createPlan(data: any): Promise<MembershipPlan> {
    return prisma.membershipPlan.create({ data });
  }

  async updatePlan(planId: string, data: any): Promise<MembershipPlan> {
    return prisma.membershipPlan.update({
      where: { id: planId },
      data,
    });
  }

  async softDeletePlan(planId: string): Promise<MembershipPlan> {
    return prisma.membershipPlan.update({
      where: { id: planId },
      data: { deletedAt: new Date() },
    });
  }

  async createMembershipTransaction(data: {
    userId: string;
    planId: string;
    amount: number;
    durationDays: number;
    gateway: string;
  }): Promise<{ order: Order; payment: Payment; membership: Membership; transaction: Transaction }> {
    return prisma.$transaction(async (tx) => {
      // 1. Create Order
      const order = await tx.order.create({
        data: {
          userId: data.userId,
          planId: data.planId,
          amount: data.amount,
          currency: "INR",
          status: "COMPLETED",
        },
      });

      // 2. Create Payment
      const payment = await tx.payment.create({
        data: {
          orderId: order.id,
          amount: data.amount,
          status: "PAID",
          gateway: data.gateway as any,
          gatewayTransactionId: `mock_tx_${Date.now()}`,
        },
      });

      // 3. Deactivate any previous active memberships
      await tx.membership.updateMany({
        where: { userId: data.userId, status: "ACTIVE" },
        data: { status: "EXPIRED" },
      });

      // 4. Create new Membership
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + data.durationDays);

      const membership = await tx.membership.create({
        data: {
          userId: data.userId,
          planId: data.planId,
          status: "ACTIVE",
          startDate,
          endDate,
        },
      });

      // 5. Create Transaction
      const transaction = await tx.transaction.create({
        data: {
          userId: data.userId,
          amount: data.amount,
          type: "CREDIT",
          description: `Purchased Membership Plan ID: ${data.planId}`,
        },
      });

      return { order, payment, membership, transaction };
    });
  }

  async findOrdersByUserId(userId: string, cursor?: string, limit: number = 10): Promise<Order[]> {
    return prisma.order.findMany({
      where: { userId },
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      include: { plan: true, payments: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: string): Promise<Membership | null> {
    return prisma.membership.findUnique({
      where: { id },
      include: { plan: true },
    });
  }

  async update(id: string, data: any): Promise<Membership> {
    return prisma.membership.update({
      where: { id },
      data,
    });
  }

  async createManualPayment(data: {
    userId: string;
    planId: string;
    amount: number;
    paymentMethod: string;
    utrNumber: string;
    receiptUrl?: string;
    bankName?: string;
    accountHolder?: string;
  }): Promise<Payment> {
    return prisma.payment.create({
      data: {
        userId: data.userId,
        planId: data.planId,
        amount: data.amount,
        status: "PENDING",
        gateway: "MANUAL",
        paymentMethod: data.paymentMethod,
        utrNumber: data.utrNumber,
        receiptUrl: data.receiptUrl,
        bankName: data.bankName,
        accountHolder: data.accountHolder,
      },
    });
  }

  async approveManualPayment(adminUserId: string, paymentId: string): Promise<any> {
    return prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({ where: { id: paymentId } });
      if (!payment || payment.status !== "PENDING") {
        return { success: false, error: "Payment not found or already processed" };
      }

      const plan = payment.planId ? await tx.membershipPlan.findUnique({ where: { id: payment.planId } }) : null;
      const durationDays = plan?.durationDays || 30;
      const userId = payment.userId!;

      // 1. Update Payment
      const updatedPayment = await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: "PAID",
          verifiedById: adminUserId,
          verifiedAt: new Date(),
        },
      });

      // 2. Deactivate previous active memberships
      await tx.membership.updateMany({
        where: { userId, status: "ACTIVE" },
        data: { status: "EXPIRED" },
      });

      // 3. Create active Membership
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + durationDays);

      const membership = await tx.membership.create({
        data: {
          userId,
          planId: payment.planId!,
          status: "ACTIVE",
          startDate,
          endDate,
        },
      });

      // 4. Create ConciergeCase if Plan 2 / Concierge
      if (plan && (plan.name.toLowerCase().includes("concierge") || plan.price >= 100000)) {
        await tx.conciergeCase.upsert({
          where: { userId },
          create: {
            userId,
            status: "OPEN",
            notes: "Activated via Premium Concierge Membership purchase.",
          },
          update: {
            status: "OPEN",
          },
        });
      }

      return {
        success: true,
        payment: updatedPayment,
        membership,
        userId,
        planName: plan?.name || "Membership",
      };
    });
  }

  async rejectManualPayment(adminUserId: string, paymentId: string, reason: string): Promise<any> {
    const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment || payment.status !== "PENDING") {
      return { success: false, error: "Payment not found or already processed" };
    }

    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: "FAILED",
        rejectionReason: reason,
        verifiedById: adminUserId,
        verifiedAt: new Date(),
      },
    });

    return {
      success: true,
      payment: updatedPayment,
      userId: payment.userId,
    };
  }
}
