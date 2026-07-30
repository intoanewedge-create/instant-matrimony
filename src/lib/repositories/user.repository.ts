import { User } from "@prisma/client";
import { prisma } from "../prisma";
import { BaseRepository } from "./base.repository";
import { IUserRepository } from "./interfaces/user.repository";

export class PrismaUserRepository extends BaseRepository<User> implements IUserRepository {
  protected modelDelegate = prisma.user;

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: { email, deletedAt: null },
    });
  }

  async findByPhone(phone: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: { phone, deletedAt: null },
    });
  }

  async findMany(params: { cursor?: string; limit: number; search?: string; role?: string; isActive?: boolean }): Promise<User[]> {
    const { cursor, limit, search, role, isActive } = params;
    const where: any = { deletedAt: null };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }
    if (role) {
      where.role = role;
    }
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    return prisma.user.findMany({
      where,
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: "desc" },
    });
  }
}
