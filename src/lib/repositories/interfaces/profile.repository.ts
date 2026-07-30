import { Profile } from "@prisma/client";

export interface IProfileRepository {
  findById(id: string): Promise<Profile | null>;
  findByUserId(userId: string): Promise<Profile | null>;
  create(data: any): Promise<Profile>;
  update(id: string, data: any): Promise<Profile>;
  softDelete(id: string): Promise<Profile>;
  exists(id: string): Promise<boolean>;
  count(where?: any): Promise<number>;
  findPendingApproval(cursor?: string, limit?: number): Promise<Profile[]>;
  findApproved(cursor?: string, limit?: number): Promise<Profile[]>;
}
