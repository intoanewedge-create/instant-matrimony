import { User } from "@prisma/client";

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByPhone(phone: string): Promise<User | null>;
  create(data: any): Promise<User>;
  update(id: string, data: any): Promise<User>;
  softDelete(id: string): Promise<User>;
  exists(id: string): Promise<boolean>;
  count(where?: any): Promise<number>;
  findMany(params: { cursor?: string; limit: number; search?: string; role?: string; isActive?: boolean }): Promise<User[]>;
}
