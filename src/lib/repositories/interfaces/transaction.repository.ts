import { Transaction } from "@prisma/client";

export interface ITransactionRepository {
  create(data: any): Promise<Transaction>;
  findById(id: string): Promise<Transaction | null>;
  findUserTransactions(userId: string): Promise<Transaction[]>;
  findAll(): Promise<Transaction[]>;
}
