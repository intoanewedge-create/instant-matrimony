import { Interest } from "@prisma/client";

export interface IInterestRepository {
  findById(id: string): Promise<Interest | null>;
  create(senderId: string, receiverId: string): Promise<Interest>;
  updateStatus(id: string, status: any): Promise<Interest>;
  findActiveBetween(senderId: string, receiverId: string): Promise<Interest | null>;
  findSent(userId: string, cursor?: string, limit?: number): Promise<Interest[]>;
  findReceived(userId: string, cursor?: string, limit?: number): Promise<Interest[]>;
  exists(id: string): Promise<boolean>;
}
