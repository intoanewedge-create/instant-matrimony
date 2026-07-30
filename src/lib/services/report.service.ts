import { BaseService } from "./base.service";
import { Result, returnSuccess, returnFailure } from "../result";
import { exportProviderRegistry } from "../reporting/export-provider-registry";
import { prisma } from "../prisma";

export class ReportService extends BaseService {
  constructor() {
    super();
  }

  async generateUsersReport(providerName: string, adminId: string): Promise<Result<{ status: string; data?: string }>> {
    try {
      const provider = exportProviderRegistry.getProvider(providerName);
      if (!provider) {
        return returnFailure("Unsupported export provider", "PROVIDER_NOT_FOUND");
      }

      const totalUsers = await prisma.user.count({ where: { deletedAt: null } });

      if (totalUsers > 100) {
        const { schedulerService, auditService } = await import("../container");
        // Enqueue background export job
        schedulerService.registerJob({
          name: `report-users-generation-${Date.now()}`,
          intervalMs: 1000 * 60 * 60 * 24, // run once essentially (or handled manually)
          run: async () => {
            await this.executeUsersExport(provider, adminId);
          },
        });

        await auditService.log(adminId, "REPORT_EXPORT_QUEUED", undefined, undefined, "Queued Users Report in background (row count > 100)");
        return returnSuccess({ status: "QUEUED" });
      }

      // Sync execution
      const exportRes = await this.executeUsersExport(provider, adminId);
      if (!exportRes.success) return exportRes as any;

      return returnSuccess({ status: "COMPLETED", data: exportRes.data });
    } catch (e: any) {
      return returnFailure(e.message, "USERS_REPORT_ERROR");
    }
  }

  async generatePaymentsReport(providerName: string, adminId: string): Promise<Result<{ status: string; data?: string }>> {
    try {
      const provider = exportProviderRegistry.getProvider(providerName);
      if (!provider) {
        return returnFailure("Unsupported export provider", "PROVIDER_NOT_FOUND");
      }

      const totalPayments = await prisma.payment.count({ where: { deletedAt: null } });

      if (totalPayments > 100) {
        const { schedulerService, auditService } = await import("../container");
        // Enqueue background export job
        schedulerService.registerJob({
          name: `report-payments-generation-${Date.now()}`,
          intervalMs: 1000 * 60 * 60 * 24,
          run: async () => {
            await this.executePaymentsExport(provider, adminId);
          },
        });

        await auditService.log(adminId, "REPORT_EXPORT_QUEUED", undefined, undefined, "Queued Payments Report in background (row count > 100)");
        return returnSuccess({ status: "QUEUED" });
      }

      // Sync execution
      const exportRes = await this.executePaymentsExport(provider, adminId);
      if (!exportRes.success) return exportRes as any;

      return returnSuccess({ status: "COMPLETED", data: exportRes.data });
    } catch (e: any) {
      return returnFailure(e.message, "PAYMENTS_REPORT_ERROR");
    }
  }

  private async executeUsersExport(provider: any, adminId: string): Promise<Result<string>> {
    const users = await prisma.user.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
    });

    const headers = ["User ID", "Name", "Email", "Role", "Active Status", "Created At"];
    const rows = users.map((u) => [
      u.id,
      u.name || "Unnamed",
      u.email,
      u.role,
      u.isActive ? "ACTIVE" : "INACTIVE",
      u.createdAt.toISOString(),
    ]);

    const res = await provider.generateReport("Registered Users Summary", headers, rows);
    if (res.success) {
      const { auditService } = await import("../container");
      await auditService.log(adminId, "REPORT_EXPORTED", undefined, undefined, `Exported users report via ${provider.name()}`);
    }
    return res;
  }

  private async executePaymentsExport(provider: any, adminId: string): Promise<Result<string>> {
    const payments = await prisma.payment.findMany({
      where: { deletedAt: null },
      include: { order: true },
    });

    const headers = ["Payment ID", "Order ID", "Amount", "Status", "Gateway", "Created At"];
    const rows = payments.map((p) => [
      p.id,
      p.orderId,
      p.amount,
      p.status,
      p.gateway,
      p.createdAt.toISOString(),
    ]);

    const res = await provider.generateReport("Financial Payments Report", headers, rows);
    if (res.success) {
      const { auditService } = await import("../container");
      await auditService.log(adminId, "REPORT_EXPORTED", undefined, undefined, `Exported payments report via ${provider.name()}`);
    }
    return res;
  }
}
export const reportService = new ReportService();
