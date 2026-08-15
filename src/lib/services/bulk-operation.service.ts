import { BaseService } from "./base.service";
import { IBulkOperationRepository } from "../repositories/interfaces/bulk-operation.repository";
import { BulkOperation } from "../domain/admin/contracts";
import { prisma } from "../prisma";
import { returnSuccess, Result } from "../result";
import { loggerService } from "./logger.service";

export class BulkOperationService extends BaseService {
  constructor(private repository: IBulkOperationRepository) {
    super();
  }

  async listOperations(limit: number = 20): Promise<Result<BulkOperation[]>> {
    try {
      const ops = await this.repository.list(limit);
      return returnSuccess(ops);
    } catch (err: any) {
      return this.returnFailure(err.message, "BULK_LIST_ERROR");
    }
  }

  async getOperation(id: string): Promise<Result<BulkOperation | null>> {
    try {
      const op = await this.repository.getById(id);
      return returnSuccess(op);
    } catch (err: any) {
      return this.returnFailure(err.message, "BULK_GET_ERROR");
    }
  }

  async executeBulk(
    type: BulkOperation["type"],
    entity: "users" | "profiles" | "campaigns" | "coupons" | "fraudCases" | "appeals" | "cmsPages",
    ids: string[],
    correlationId: string,
    actionPayload?: any
  ): Promise<Result<BulkOperation>> {
    try {
      // 1. Create bulk operation tracking ticket
      const op = await this.repository.create(type, ids.length, correlationId);

      // 2. Spawn background processing loop (Non-blocking)
      this.runProcessingLoop(op.id, entity, type, ids, actionPayload);

      return returnSuccess(op);
    } catch (err: any) {
      return this.returnFailure(err.message, "BULK_INITIATE_ERROR");
    }
  }

  private async runProcessingLoop(
    opId: string,
    entity: string,
    type: BulkOperation["type"],
    ids: string[],
    _payload?: any
  ): Promise<void> {
    let success = 0;
    let failure = 0;
    const errors: Array<{ id: string; error: string }> = [];

    // Keep backups for rollback if requested
    const rollbacks: Array<{ id: string; originalData: any }> = [];

    // Update status to RUNNING
    await this.repository.updateProgress(opId, 0, 0, "RUNNING");

    for (const id of ids) {
      try {
        // Fetch original item to support rollbacks
        let original: any = null;
        if (entity === "users") {
          original = await prisma.user.findUnique({ where: { id } });
          if (type === "SUSPEND") {
            await prisma.user.update({ where: { id }, data: { role: "BLOCKED" as any } });
          } else if (type === "RESTORE") {
            await prisma.user.update({ where: { id }, data: { role: "MEMBER" as any } });
          } else if (type === "DELETE") {
            const now = new Date();
            const timestamp = now.getTime();
            const cleanId = original.id.replace(/-/g, "").slice(0, 8);
            const anonymizedEmail = original.email.startsWith("deleted_")
              ? original.email
              : `deleted_${timestamp}_${cleanId}_${original.email}`;
            const anonymizedPhone = original.phone
              ? original.phone.startsWith("deleted_")
                ? original.phone
                : `deleted_${timestamp}_${cleanId}_${original.phone}`
              : null;

            await prisma.user.update({
              where: { id },
              data: {
                isActive: false,
                accountStatus: "SUSPENDED",
                deletedAt: now,
                email: anonymizedEmail,
                phone: anonymizedPhone,
              },
            });
            await prisma.profile.updateMany({
              where: { userId: id },
              data: {
                status: "DELETED",
                deletedAt: now,
              },
            });
          }
        } else if (entity === "profiles") {
          original = await prisma.profile.findUnique({ where: { id } });
          if (type === "APPROVE") {
            await prisma.profile.update({ where: { id }, data: { status: "APPROVED" } });
          } else if (type === "REJECT") {
            await prisma.profile.update({ where: { id }, data: { status: "REJECTED" } });
          } else if (type === "SUSPEND") {
            await prisma.profile.update({ where: { id }, data: { status: "SUSPENDED" } });
          } else if (type === "RESTORE") {
            await prisma.profile.update({ where: { id }, data: { status: "APPROVED" } });
          } else if (type === "DELETE") {
            const now = new Date();
            await prisma.profile.update({
              where: { id },
              data: {
                status: "DELETED",
                deletedAt: now,
              },
            });
            const user = await prisma.user.findUnique({ where: { id: original.userId } });
            if (user) {
              const timestamp = now.getTime();
              const cleanId = user.id.replace(/-/g, "").slice(0, 8);
              const anonymizedEmail = user.email.startsWith("deleted_")
                ? user.email
                : `deleted_${timestamp}_${cleanId}_${user.email}`;
              const anonymizedPhone = user.phone
                ? user.phone.startsWith("deleted_")
                  ? user.phone
                  : `deleted_${timestamp}_${cleanId}_${user.phone}`
                : null;

              await prisma.user.update({
                where: { id: user.id },
                data: {
                  isActive: false,
                  accountStatus: "SUSPENDED",
                  deletedAt: now,
                  email: anonymizedEmail,
                  phone: anonymizedPhone,
                },
              });
            }
          }
        } else if (entity === "cmsPages") {
          original = await prisma.cmsPage.findUnique({ where: { id } });
          if (type === "PUBLISH") {
            await prisma.cmsPage.update({ where: { id }, data: { status: "PUBLISHED" } });
          } else if (type === "ARCHIVE") {
            await prisma.cmsPage.update({ where: { id }, data: { status: "ARCHIVED" } });
          } else if (type === "DELETE") {
            await prisma.cmsPage.delete({ where: { id } });
          }
        } else if (entity === "campaigns") {
          original = await prisma.campaign.findUnique({ where: { id } });
          if (type === "PUBLISH") {
            await prisma.campaign.update({ where: { id }, data: { status: "ACTIVE" } });
          } else if (type === "ARCHIVE") {
            await prisma.campaign.update({ where: { id }, data: { status: "ARCHIVED" } });
          } else if (type === "DELETE") {
            await prisma.campaign.delete({ where: { id } });
          }
        } else if (entity === "coupons") {
          original = await prisma.coupon.findUnique({ where: { id } });
          if (type === "ARCHIVE") {
            await prisma.coupon.update({ where: { id }, data: { isActive: false } });
          } else if (type === "DELETE") {
            await prisma.coupon.delete({ where: { id } });
          }
        } else if (entity === "fraudCases") {
          original = await prisma.fraudCase.findUnique({ where: { id } });
          if (type === "APPROVE") {
            await prisma.fraudCase.update({ where: { id }, data: { status: "RESOLVED" } });
          } else if (type === "REJECT") {
            await prisma.fraudCase.update({ where: { id }, data: { status: "DISMISSED" } });
          }
        } else if (entity === "appeals") {
          original = await prisma.appeal.findUnique({ where: { id } });
          if (type === "APPROVE") {
            await prisma.appeal.update({ where: { id }, data: { status: "APPROVED" } });
          } else if (type === "REJECT") {
            await prisma.appeal.update({ where: { id }, data: { status: "REJECTED" } });
          }
        }

        if (original) {
          rollbacks.push({ id, originalData: original });
        }

        success++;
      } catch (err: any) {
        failure++;
        errors.push({ id, error: err.message });
      }

      // Update progress intermediate
      await this.repository.updateProgress(opId, success, failure, "RUNNING");
    }

    const finalStatus = failure === 0 ? "COMPLETED" : success === 0 ? "FAILED" : "PARTIAL_SUCCESS";
    await this.repository.updateProgress(opId, success, failure, finalStatus);
    loggerService.info(`Bulk operation ${opId} finished processing. Success: ${success}, Failure: ${failure}`);
  }
}
