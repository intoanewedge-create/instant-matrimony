import { ModerationHistory } from "@prisma/client";

export interface IModerationRepository {
  findById(id: string): Promise<ModerationHistory | null>;
  create(data: any): Promise<ModerationHistory>;
  findByTargetUserId(targetUserId: string): Promise<ModerationHistory[]>;
  findRecent(limit?: number): Promise<ModerationHistory[]>;
}
