import { Transaction } from "@prisma/client";
import { prisma } from "../prisma";
import { ITransactionRepository } from "./interfaces/transaction.repository";

export class PrismaTransactionRepository implements ITransactionRepository {
  async create(data: any): Promise<Transaction> {
    return prisma.transaction.create({ data });
  }

  async findById(id: string): Promise<Transaction | null> {
    return prisma.transaction.findUnique({ where: { id } });
  }

  async findUserTransactions(userId: string): Promise<Transaction[]> {
    return prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async findAll(): Promise<Transaction[]> {
    return prisma.transaction.findMany({
      include: { user: true },
      orderBy: { createdAt: "desc" },
    }) as any;
  }
}
