import { Media } from "@prisma/client";

export interface IMediaRepository {
  findById(id: string): Promise<Media | null>;
  create(data: any): Promise<Media>;
  update(id: string, data: any): Promise<Media>;
  softDelete(id: string): Promise<Media>;
  exists(id: string): Promise<boolean>;
  findByKey(key: string): Promise<Media | null>;
  findByUserId(userId: string): Promise<Media[]>;
}
