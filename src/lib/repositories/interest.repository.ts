import { Interest } from "@prisma/client";
import { prisma } from "../prisma";
import { IInterestRepository } from "./interfaces/interest.repository";

export class PrismaInterestRepository implements IInterestRepository {
  protected modelDelegate = prisma.interest;

  async create(senderId: string, receiverId: string): Promise<Interest> {
    return prisma.interest.create({
      data: {
        senderId,
        receiverId,
        status: "PENDING",
      },
    }) as any;
  }

  async updateStatus(id: string, status: any): Promise<Interest> {
    return prisma.interest.update({
      where: { id },
      data: { status },
    });
  }

  async findActiveBetween(senderId: string, receiverId: string): Promise<Interest | null> {
    return prisma.interest.findFirst({
      where: {
        OR: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId },
        ],
      },
    });
  }

  async findSent(userId: string, cursor?: string, limit: number = 10): Promise<Interest[]> {
    return prisma.interest.findMany({
      where: { senderId: userId },
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      include: {
        receiver: {
          include: {
            profile: {
              include: { photos: true },
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    }) as any;
  }

  async findReceived(userId: string, cursor?: string, limit: number = 10): Promise<Interest[]> {
    return prisma.interest.findMany({
      where: { receiverId: userId },
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      include: {
        sender: {
          include: {
            profile: {
              include: { photos: true },
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    }) as any;
  }

  async findById(id: string): Promise<Interest | null> {
    return prisma.interest.findUnique({ where: { id } });
  }

  async exists(id: string): Promise<boolean> {
    const count = await prisma.interest.count({ where: { id } });
    return count > 0;
  }
}
