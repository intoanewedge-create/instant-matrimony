import { BaseRepository } from "./base.repository";
import { IFeatureFlagRepository } from "./interfaces/feature-flag.repository";
import { prisma } from "../prisma";

export class PrismaFeatureFlagRepository
  extends BaseRepository<any>
  implements IFeatureFlagRepository
{
  protected modelDelegate = prisma.featureFlag;

  async findByKey(key: string): Promise<any | null> {
    return this.modelDelegate.findUnique({
      where: { key },
    });
  }

  async upsert(
    key: string,
    enabled: boolean,
    value: string = "true",
    description?: string,
    category?: string
  ): Promise<any> {
    return this.modelDelegate.upsert({
      where: { key },
      update: { enabled, value, description, category },
      create: { key, enabled, value, description, category },
    });
  }

  async listAll(): Promise<any[]> {
    return this.modelDelegate.findMany({
      orderBy: { key: "asc" },
    });
  }

  async update(key: string, enabled: boolean, value?: string): Promise<any> {
    return this.modelDelegate.update({
      where: { key },
      data: {
        enabled,
        ...(value !== undefined ? { value } : {}),
      },
    });
  }
}
