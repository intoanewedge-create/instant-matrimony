import { Invoice } from "@prisma/client";
import { prisma } from "../prisma";
import { IInvoiceRepository } from "./interfaces/invoice.repository";

export class PrismaInvoiceRepository implements IInvoiceRepository {
  async create(data: any): Promise<Invoice> {
    return prisma.invoice.create({ data });
  }

  async findById(id: string): Promise<Invoice | null> {
    return prisma.invoice.findUnique({
      where: { id },
      include: { order: { include: { user: true, plan: true } } },
    }) as any;
  }

  async findByOrderId(orderId: string): Promise<Invoice | null> {
    return prisma.invoice.findUnique({
      where: { orderId },
      include: { order: { include: { user: true, plan: true } } },
    }) as any;
  }

  async findByInvoiceNumber(invoiceNumber: string): Promise<Invoice | null> {
    return prisma.invoice.findUnique({
      where: { invoiceNumber },
      include: { order: { include: { user: true, plan: true } } },
    }) as any;
  }

  async update(id: string, data: any): Promise<Invoice> {
    return prisma.invoice.update({
      where: { id },
      data,
    });
  }

  async findUserInvoices(userId: string): Promise<Invoice[]> {
    return prisma.invoice.findMany({
      where: { order: { userId } },
      include: { order: { include: { plan: true } } },
      orderBy: { createdAt: "desc" },
    }) as any;
  }

  async findAll(): Promise<Invoice[]> {
    return prisma.invoice.findMany({
      include: { order: { include: { user: true, plan: true } } },
      orderBy: { createdAt: "desc" },
    }) as any;
  }
}
