import { User } from "@prisma/client";
import { prisma } from "../prisma";
import { BaseRepository } from "./base.repository";
import { IUserRepository } from "./interfaces/user.repository";

export class PrismaUserRepository extends BaseRepository<User> implements IUserRepository {
  protected modelDelegate = prisma.user;

  async findByEmail(email: string): Promise<User | null> {
    const cleanEmail = email?.trim().toLowerCase();
    if (!cleanEmail) return null;
    return prisma.user.findFirst({
      where: { email: { equals: cleanEmail, mode: "insensitive" }, deletedAt: null },
    });
  }

  async findByPhone(phone: string): Promise<User | null> {
    const cleanPhone = phone?.trim();
    if (!cleanPhone) return null;
    const phoneVariants = [cleanPhone];
    if (cleanPhone.startsWith("+91")) {
      phoneVariants.push(cleanPhone.slice(3).trim());
    } else if (cleanPhone.length === 10) {
      phoneVariants.push(`+91${cleanPhone}`);
    }

    return prisma.user.findFirst({
      where: {
        phone: { in: phoneVariants },
        deletedAt: null,
      },
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
