import { Order } from "@prisma/client";
import { prisma } from "../prisma";
import { IOrderRepository } from "./interfaces/order.repository";

export class PrismaOrderRepository implements IOrderRepository {
  async create(data: any): Promise<Order> {
    return prisma.order.create({ data });
  }

  async findById(id: string): Promise<Order | null> {
    return prisma.order.findUnique({
      where: { id },
      include: { payments: true, invoice: true },
    }) as any;
  }

  async findByGatewayOrderId(gatewayOrderId: string): Promise<Order | null> {
    return prisma.order.findFirst({
      where: { gatewayOrderId },
      include: { payments: true, invoice: true },
    }) as any;
  }

  async update(id: string, data: any): Promise<Order> {
    return prisma.order.update({
      where: { id },
      data,
    });
  }

  async findUserOrders(userId: string): Promise<Order[]> {
    return prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async findAll(): Promise<Order[]> {
    return prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: true, plan: true },
    }) as any;
  }
}
