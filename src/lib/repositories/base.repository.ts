import { prisma } from "../prisma";

export abstract class BaseRepository<T, CreateInput = any, UpdateInput = any> {
  protected abstract modelDelegate: any;

  async findById(id: string): Promise<T | null> {
    return this.modelDelegate.findUnique({
      where: { id },
    });
  }

  async create(data: CreateInput): Promise<T> {
    return this.modelDelegate.create({
      data,
    });
  }

  async update(id: string, data: UpdateInput): Promise<T> {
    return this.modelDelegate.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string): Promise<T> {
    return this.modelDelegate.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.modelDelegate.count({
      where: { id },
    });
    return count > 0;
  }

  async count(where: any = {}): Promise<number> {
    return this.modelDelegate.count({
      where,
    });
  }
}
