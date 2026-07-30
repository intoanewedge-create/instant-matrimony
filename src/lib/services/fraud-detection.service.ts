import { BaseService } from "./base.service";
import { Result, returnSuccess, returnFailure } from "../result";
import { fraudProviderRegistry } from "../fraud/fraud-provider-registry";
import { prisma } from "../prisma";
import { FraudCaseDto } from "../domain/admin-contracts";
import { loggerService } from "./logger.service";

export class FraudDetectionService extends BaseService {
  constructor() {
    super();
  }

  async runFraudScan(userId: string): Promise<Result<any>> {
    try {
      const scanRes = await fraudProviderRegistry.analyzeUserWithFallback(userId);
      if (!scanRes.success || !scanRes.data) {
        return returnFailure(scanRes.error || "Failed to scan", "FRAUD_SCAN_ERROR");
      }

      const score = scanRes.data.score;
      const reasons = scanRes.data.reasons.join(", ");
      const isAutoSuspend = score >= 85;

      // Upsert Fraud Case record
      const fraudCase = await prisma.fraudCase.create({
        data: {
          userId,
          score,
          reasons,
          status: isAutoSuspend ? "RESOLVED_SUSPENDED" : "PENDING",
        },
      });

      // Auto suspend profile if risk is extremely high
      if (isAutoSuspend) {
        await prisma.profile.update({
          where: { userId },
          data: { status: "SUSPENDED" },
        });

        await prisma.user.update({
          where: { id: userId },
          data: { isActive: false },
        });

        loggerService.warn(`[FraudDetectionService] Auto-suspended user ${userId} due to high threat score: ${score}`);
        scanRes.data.autoSuspended = true;
      }

      return returnSuccess(scanRes.data);
    } catch (e: any) {
      return returnFailure(e.message, "FRAUD_SCAN_SERVICE_ERROR");
    }
  }

  async getFraudCases(status?: string, limit = 50): Promise<Result<FraudCaseDto[]>> {
    try {
      const cases = await prisma.fraudCase.findMany({
        where: status ? { status } : undefined,
        take: limit,
        orderBy: { detectedAt: "desc" },
        include: {
          user: true,
        },
      });

      const formatted = cases.map((c) => ({
        id: c.id,
        userId: c.userId,
        userName: c.user?.name || "Unnamed User",
        email: c.user?.email || "",
        score: c.score,
        reasons: c.reasons.split(", "),
        status: c.status as any,
        detectedAt: c.detectedAt,
      }));

      return returnSuccess(formatted);
    } catch (e: any) {
      return returnFailure(e.message, "GET_FRAUD_CASES_ERROR");
    }
  }

  async resolveFraudCase(caseId: string, status: "RESOLVED_SUSPENDED" | "RESOLVED_CLEARED", note?: string): Promise<Result<any>> {
    try {
      const fraudCase = await prisma.fraudCase.update({
        where: { id: caseId },
        data: { status },
      });

      if (status === "RESOLVED_CLEARED") {
        // Restore user active state
        await prisma.profile.update({
          where: { userId: fraudCase.userId },
          data: { status: "APPROVED" },
        });

        await prisma.user.update({
          where: { id: fraudCase.userId },
          data: { isActive: true },
        });
      }

      return returnSuccess(fraudCase);
    } catch (e: any) {
      return returnFailure(e.message, "RESOLVE_FRAUD_CASE_ERROR");
    }
  }
}
export const fraudDetectionService = new FraudDetectionService();
