import { Payment } from "@prisma/client";
import { prisma } from "../prisma";
import { IPaymentRepository } from "./interfaces/payment.repository";

export class PrismaPaymentRepository implements IPaymentRepository {
  async create(data: any): Promise<Payment> {
    return prisma.payment.create({ data });
  }

  async findById(id: string): Promise<Payment | null> {
    return prisma.payment.findUnique({
      where: { id },
      include: { order: true },
    }) as any;
  }

  async findByGatewayTransactionId(gatewayTransactionId: string): Promise<Payment | null> {
    return prisma.payment.findFirst({
      where: { gatewayTransactionId },
      include: { order: true },
    }) as any;
  }

  async update(id: string, data: any): Promise<Payment> {
    return prisma.payment.update({
      where: { id },
      data,
    });
  }

  async findUserPayments(userId: string): Promise<Payment[]> {
    return prisma.payment.findMany({
      where: { order: { userId } },
      include: { order: { include: { plan: true } } },
      orderBy: { createdAt: "desc" },
    }) as any;
  }

  async findAll(): Promise<Payment[]> {
    return prisma.payment.findMany({
      include: { order: { include: { user: true, plan: true } } },
      orderBy: { createdAt: "desc" },
    }) as any;
  }
}
