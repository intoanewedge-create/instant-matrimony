import { IdentityVerification } from "@prisma/client";

export interface IVerificationRepository {
  findById(id: string): Promise<IdentityVerification | null>;
  create(data: any): Promise<IdentityVerification>;
  update(id: string, data: any): Promise<IdentityVerification>;
  softDelete(id: string): Promise<IdentityVerification>;
  exists(id: string): Promise<boolean>;
  findByUserId(userId: string): Promise<IdentityVerification | null>;
  findPendingQueue(): Promise<IdentityVerification[]>;
  findHistory(): Promise<IdentityVerification[]>;
}
