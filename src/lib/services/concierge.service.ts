import { BaseService } from "./base.service";
import { Result } from "../result";
import { prisma } from "../prisma";
import { NotificationService } from "./notification.service";

export class ConciergeService extends BaseService {
  constructor(private notificationService: NotificationService) {
    super();
  }

  async getCases(assignedAdminId?: string, status?: string): Promise<Result<any>> {
    try {
      const cases = await prisma.conciergeCase.findMany({
        where: {
          ...(assignedAdminId ? { assignedAdminId } : {}),
          ...(status ? { status: status as any } : {}),
        },
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } },
          assignedAdmin: { select: { id: true, name: true, email: true } },
          shortlists: { include: { targetUser: { select: { id: true, name: true } } } },
          meetings: true,
          updates: { orderBy: { createdAt: "desc" }, take: 3 },
        },
        orderBy: { updatedAt: "desc" },
      });
      return this.returnSuccess(cases);
    } catch (e: any) {
      return this.returnFailure(e.message, "CONCIERGE_CASES_FETCH_ERROR");
    }
  }

  async getCaseById(caseId: string): Promise<Result<any>> {
    try {
      const caseItem = await prisma.conciergeCase.findUnique({
        where: { id: caseId },
        include: {
          user: {
            select: { id: true, name: true, email: true, phone: true },
          },
          assignedAdmin: {
            select: { id: true, name: true, email: true },
          },
          updates: { orderBy: { createdAt: "desc" } },
          meetings: { orderBy: { scheduledAt: "asc" } },
          callLogs: { orderBy: { calledAt: "desc" } },
          attachments: { orderBy: { createdAt: "desc" } },
          shortlists: {
            include: {
              targetUser: {
                select: { id: true, name: true, email: true, phone: true },
              },
            },
            orderBy: { createdAt: "desc" },
          },
        },
      });

      if (!caseItem) return this.returnFailure("Concierge case not found", "NOT_FOUND");
      return this.returnSuccess(caseItem);
    } catch (e: any) {
      return this.returnFailure(e.message, "CONCIERGE_CASE_FETCH_ERROR");
    }
  }

  async getUserCase(userId: string): Promise<Result<any>> {
    try {
      const caseItem = await prisma.conciergeCase.findUnique({
        where: { userId },
        include: {
          assignedAdmin: { select: { name: true, email: true } },
          updates: {
            where: { isCustomerVisible: true },
            orderBy: { createdAt: "desc" },
          },
          meetings: { orderBy: { scheduledAt: "asc" } },
          attachments: true,
          shortlists: {
            include: {
              targetUser: { select: { id: true, name: true } },
            },
          },
        },
      });

      return this.returnSuccess(caseItem || null);
    } catch (e: any) {
      return this.returnFailure(e.message, "USER_CONCIERGE_CASE_ERROR");
    }
  }

  async updateStatus(adminUserId: string, caseId: string, status: string): Promise<Result<any>> {
    try {
      const updated = await prisma.conciergeCase.update({
        where: { id: caseId },
        data: {
          status: status as any,
          ...(status === "CLOSED" ? { closedAt: new Date() } : {}),
        },
      });

      // Auto publish customer update
      await prisma.conciergeUpdate.create({
        data: {
          caseId,
          authorId: adminUserId,
          content: `Concierge Case status updated to ${status.replace(/_/g, " ")}.`,
          isCustomerVisible: true,
        },
      });

      await this.notificationService.enqueue(
        updated.userId,
        "Concierge Progress Update",
        `Your Relationship Manager updated your Concierge case status to "${status.replace(/_/g, " ")}".`,
        "INFO"
      );

      return this.returnSuccess(updated);
    } catch (e: any) {
      return this.returnFailure(e.message, "STATUS_UPDATE_ERROR");
    }
  }

  async assignAdmin(adminUserId: string, caseId: string, targetAdminId: string): Promise<Result<any>> {
    try {
      const updated = await prisma.conciergeCase.update({
        where: { id: caseId },
        data: { assignedAdminId: targetAdminId },
        include: { assignedAdmin: { select: { name: true } } },
      });

      await this.notificationService.enqueue(
        updated.userId,
        "Dedicated Manager Assigned",
        `Your Concierge case has been assigned to Relationship Manager ${updated.assignedAdmin?.name || "Support"}.`,
        "SUCCESS"
      );

      return this.returnSuccess(updated);
    } catch (e: any) {
      return this.returnFailure(e.message, "ASSIGN_ADMIN_ERROR");
    }
  }

  async publishUpdate(adminUserId: string, caseId: string, content: string, isCustomerVisible: boolean): Promise<Result<any>> {
    try {
      const update = await prisma.conciergeUpdate.create({
        data: {
          caseId,
          authorId: adminUserId,
          content,
          isCustomerVisible,
        },
      });

      if (isCustomerVisible) {
        const cCase = await prisma.conciergeCase.findUnique({ where: { id: caseId } });
        if (cCase) {
          await this.notificationService.enqueue(
            cCase.userId,
            "New Concierge Update",
            `Your Relationship Manager posted an update: "${content.substring(0, 40)}..."`,
            "INFO"
          );
        }
      }

      return this.returnSuccess(update);
    } catch (e: any) {
      return this.returnFailure(e.message, "PUBLISH_UPDATE_ERROR");
    }
  }

  async addCustomerNote(userId: string, caseId: string, content: string): Promise<Result<any>> {
    try {
      const cCase = await prisma.conciergeCase.findUnique({ where: { id: caseId } });
      if (!cCase || cCase.userId !== userId) {
        return this.returnFailure("Unauthorized access to concierge case", "FORBIDDEN");
      }

      const update = await prisma.conciergeUpdate.create({
        data: {
          caseId,
          authorId: userId,
          content,
          isCustomerVisible: true,
        },
      });

      if (cCase.assignedAdminId) {
        await this.notificationService.enqueue(
          cCase.assignedAdminId,
          "New Concierge Customer Note",
          `Customer posted a note on case #${caseId}: "${content.substring(0, 40)}..."`,
          "INFO"
        );
      }

      return this.returnSuccess(update);
    } catch (e: any) {
      return this.returnFailure(e.message, "ADD_CUSTOMER_NOTE_ERROR");
    }
  }

  async shortlistMatch(adminUserId: string, caseId: string, targetUserId: string, notes?: string): Promise<Result<any>> {
    try {
      const shortlist = await prisma.conciergeShortlist.upsert({
        where: { caseId_targetUserId: { caseId, targetUserId } },
        create: {
          caseId,
          targetUserId,
          notes,
          status: "SHORTLISTED",
        },
        update: {
          notes,
          status: "SHORTLISTED",
        },
      });

      return this.returnSuccess(shortlist);
    } catch (e: any) {
      return this.returnFailure(e.message, "SHORTLIST_ERROR");
    }
  }

  async updateShortlistStatus(adminUserId: string, shortlistId: string, status: string, familyResponse?: string): Promise<Result<any>> {
    try {
      const updated = await prisma.conciergeShortlist.update({
        where: { id: shortlistId },
        data: {
          status,
          ...(familyResponse ? { familyResponse } : {}),
        },
      });
      return this.returnSuccess(updated);
    } catch (e: any) {
      return this.returnFailure(e.message, "SHORTLIST_UPDATE_ERROR");
    }
  }

  async scheduleMeeting(adminUserId: string, caseId: string, title: string, scheduledAt: Date, location?: string, notes?: string): Promise<Result<any>> {
    try {
      const meeting = await prisma.conciergeMeeting.create({
        data: {
          caseId,
          title,
          scheduledAt,
          location,
          notes,
          status: "SCHEDULED",
        },
      });

      const cCase = await prisma.conciergeCase.findUnique({ where: { id: caseId } });
      if (cCase) {
        await this.notificationService.enqueue(
          cCase.userId,
          "Concierge Meeting Scheduled",
          `A match meeting "${title}" has been scheduled for ${new Date(scheduledAt).toLocaleString()}.`,
          "SUCCESS"
        );
      }

      return this.returnSuccess(meeting);
    } catch (e: any) {
      return this.returnFailure(e.message, "MEETING_SCHEDULE_ERROR");
    }
  }

  async logCall(adminUserId: string, caseId: string, person: string, duration: number, notes: string): Promise<Result<any>> {
    try {
      const callLog = await prisma.conciergeCallLog.create({
        data: {
          caseId,
          person,
          duration,
          notes,
        },
      });
      return this.returnSuccess(callLog);
    } catch (e: any) {
      return this.returnFailure(e.message, "CALL_LOG_ERROR");
    }
  }

  async addAttachment(adminUserId: string, caseId: string, fileName: string, fileUrl: string, fileType?: string): Promise<Result<any>> {
    try {
      const attachment = await prisma.conciergeAttachment.create({
        data: {
          caseId,
          fileName,
          fileUrl,
          fileType,
        },
      });
      return this.returnSuccess(attachment);
    } catch (e: any) {
      return this.returnFailure(e.message, "ATTACHMENT_ADD_ERROR");
    }
  }
}
import { container } from "../container";

export const conciergeService = new ConciergeService(container.services.notificationService);
