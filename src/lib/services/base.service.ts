import { Result, returnSuccess, returnFailure } from "../result";
import { prisma } from "../prisma";

export abstract class BaseService {
  protected returnSuccess<T>(data: T): Result<T> {
    return returnSuccess(data);
  }

  protected returnFailure<T>(error: string, code?: string): Result<T> {
    return returnFailure(error, code);
  }

  protected async executeTransaction<T>(fn: (tx: any) => Promise<T>): Promise<T> {
    return prisma.$transaction(fn);
  }
}
