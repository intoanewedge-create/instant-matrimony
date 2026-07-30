import { Photo } from "@prisma/client";

export interface IPhotoRepository {
  findById(id: string): Promise<Photo | null>;
  create(data: any): Promise<Photo>;
  update(id: string, data: any): Promise<Photo>;
  softDelete(id: string): Promise<Photo>;
  exists(id: string): Promise<boolean>;
  count(where?: any): Promise<number>;
  findByProfileId(profileId: string): Promise<Photo[]>;
  findPendingApproval(): Promise<Photo[]>;
  clearPrimary(profileId: string): Promise<void>;
}
