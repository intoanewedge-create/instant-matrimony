import { PasswordHistory } from "@prisma/client";

export interface IPasswordHistoryRepository {
  create(userId: string, hash: string, tx?: any): Promise<PasswordHistory>;
  getByUserId(userId: string, limit: number): Promise<PasswordHistory[]>;
  deleteOldest(userId: string, keepCount: number, tx?: any): Promise<void>;
}
