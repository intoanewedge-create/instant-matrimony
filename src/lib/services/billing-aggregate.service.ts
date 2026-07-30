import { Result } from "../result";
import { Order, Payment, Invoice, Transaction, MembershipStatus, OrderStatus, PaymentStatus } from "@prisma/client";
import { IOrderRepository } from "../repositories/interfaces/order.repository";
import { IPaymentRepository } from "../repositories/interfaces/payment.repository";
import { IInvoiceRepository } from "../repositories/interfaces/invoice.repository";
import { ITransactionRepository } from "../repositories/interfaces/transaction.repository";
import { IMembershipRepository } from "../repositories/interfaces/membership.repository";
import { PaymentProvider } from "../payments/payment-provider";
import { AuditService } from "./audit.service";
import { prisma } from "../prisma";
import { revalidatePath, revalidateTag } from "next/cache";

export class BillingAggregate {
  constructor(
    private orderRepo: IOrderRepository,
    private paymentRepo: IPaymentRepository,
    private invoiceRepo: IInvoiceRepository,
    private transactionRepo: ITransactionRepository,
    private membershipRepo: IMembershipRepository,
    private paymentProvider: PaymentProvider,
    private auditService: AuditService
  ) {}

  async createCheckout(userId: string, planId: string, amount: number, successUrl: string, cancelUrl: string): Promise<Result<any>> {
    try {
      const order = await this.orderRepo.create({
        userId,
        planId,
        amount,
        status: OrderStatus.PENDING,
      });

      const checkoutRes = await this.paymentProvider.createCheckout({
        orderId: order.id,
        amount,
        currency: "INR",
        successUrl,
        cancelUrl,
        userId,
        planName: `Premium Plan Subscription`,
      });

      if (!checkoutRes.success || !checkoutRes.data) {
        await this.orderRepo.update(order.id, { status: OrderStatus.FAILED });
        return { success: false, error: checkoutRes.error };
      }

      await this.orderRepo.update(order.id, {
        gatewayOrderId: checkoutRes.data.gatewayOrderId,
      });

      await this.paymentRepo.create({
        orderId: order.id,
        amount,
        status: PaymentStatus.PENDING,
        gateway: "STRIPE",
        gatewayTransactionId: checkoutRes.data.sessionId,
      });

      return { success: true, data: checkoutRes.data };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  async handleWebhook(rawBody: string, signature: string): Promise<Result<boolean>> {
    try {
      const verifyRes = await this.paymentProvider.verifyWebhook(rawBody, signature);
      if (!verifyRes.success || !verifyRes.data || !verifyRes.data.isValid) {
        return { success: false, error: "Invalid webhook signature" };
      }

      const event = verifyRes.data;
      if (event.event === "checkout.session.completed" || event.event === "payment.captured") {
        const payload = event.payload;
        const orderId = payload.client_reference_id || payload.receipt;
        const gatewayTransactionId = payload.id;
        const amount = (payload.amount_total || payload.amount || 0) / 100;

        if (orderId) {
          const order = await this.orderRepo.findById(orderId);
          if (order) {
            await prisma.$transaction(async (tx) => {
              await tx.order.update({
                where: { id: order.id },
                data: { status: OrderStatus.COMPLETED },
              });

              const existingPayment = await tx.payment.findFirst({
                where: { orderId: order.id },
              });

              if (existingPayment) {
                await tx.payment.update({
                  where: { id: existingPayment.id },
                  data: { status: PaymentStatus.PAID, gatewayTransactionId },
                });
              } else {
                await tx.payment.create({
                  data: {
                    orderId: order.id,
                    amount,
                    status: PaymentStatus.PAID,
                    gateway: "STRIPE",
                    gatewayTransactionId,
                  },
                });
              }

              const invoiceNumber = `INV-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
              await tx.invoice.create({
                data: {
                  orderId: order.id,
                  invoiceNumber,
                  amount,
                  status: "PAID",
                },
              });

              await tx.transaction.create({
                data: {
                  userId: order.userId,
                  amount,
                  type: "CREDIT",
                  description: `Payment for plan ${order.planId}`,
                },
              });

              const durationDays = 30;
              await tx.membership.create({
                data: {
                  userId: order.userId,
                  planId: order.planId,
                  status: MembershipStatus.ACTIVE,
                  startDate: new Date(),
                  endDate: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000),
                },
              });
            });

            await this.auditService.log(
              order.userId,
              "PAYMENT_SUCCESS",
              undefined,
              undefined,
              `Order ${order.id} paid successfully`
            );

            revalidatePath("/dashboard");
            revalidateTag("membership", "max");
          }
        }
      }

      return { success: true, data: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  async cancelSubscription(userId: string, membershipId: string): Promise<Result<boolean>> {
    try {
      const membership = await this.membershipRepo.findById(membershipId);
      if (!membership || membership.userId !== userId) {
        return { success: false, error: "Membership not found" };
      }

      if (membership.gatewaySubscriptionId) {
        const cancelRes = await this.paymentProvider.cancelSubscription(membership.gatewaySubscriptionId);
        if (!cancelRes.success) {
          return { success: false, error: cancelRes.error };
        }
      }

      await this.membershipRepo.update(membershipId, {
        cancelAtPeriodEnd: true,
      });

      await this.auditService.log(
        userId,
        "SUBSCRIPTION_CANCEL",
        undefined,
        undefined,
        `Subscription ${membershipId} cancelled`
      );
      revalidatePath("/dashboard/billing");

      return { success: true, data: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }
}
