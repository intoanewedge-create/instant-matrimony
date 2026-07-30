import { ISearchIndexRepository } from "./interfaces/search-index.repository";
import { SearchContext, SearchResult } from "../domain/admin/contracts";
import { prisma } from "../prisma";
import { loggerService } from "../services/logger.service";

export class PrismaSearchIndexRepository implements ISearchIndexRepository {
  async search(context: SearchContext): Promise<SearchResult[]> {
    const query = context.query || "";
    const types = context.types || [];
    const limit = context.limit || 50;

    const results: SearchResult[] = [];
    const lowerQuery = query.toLowerCase();

    // Helper to check if a type is requested
    const shouldSearch = (type: string) => types.length === 0 || types.includes(type);

    try {
      // 1. Users
      if (shouldSearch("user")) {
        const users = await prisma.user.findMany({
          where: query
            ? {
                OR: [
                  { name: { contains: query, mode: "insensitive" } },
                  { email: { contains: query, mode: "insensitive" } },
                ],
              }
            : {},
          take: limit,
        });
        users.forEach((u) => {
          results.push({
            id: u.id,
            type: "user",
            title: u.name || "Unnamed User",
            description: u.email,
            status: u.role,
            createdAt: u.createdAt,
            metadata: { role: u.role, emailVerified: !!u.emailVerified },
          });
        });
      }

      // 2. Profiles
      if (shouldSearch("profile")) {
        const profiles = await prisma.profile.findMany({
          where: query
            ? {
                OR: [
                  { bio: { contains: query, mode: "insensitive" } },
                  { city: { contains: query, mode: "insensitive" } },
                  { occupation: { contains: query, mode: "insensitive" } },
                ],
              }
            : {},
          take: limit,
        });
        profiles.forEach((p) => {
          results.push({
            id: p.id,
            type: "profile",
            title: `Profile of User ${p.userId}`,
            description: p.bio || "No bio content.",
            status: p.status,
            createdAt: p.createdAt,
            metadata: { city: p.city, occupation: p.occupation },
          });
        });
      }

      // 3. Memberships
      if (shouldSearch("membership")) {
        const memberships = await prisma.membership.findMany({
          where: query
            ? {
                OR: [
                  { gatewaySubscriptionId: { contains: query, mode: "insensitive" } },
                ],
              }
            : {},
          take: limit,
        });
        memberships.forEach((m) => {
          results.push({
            id: m.id,
            type: "membership",
            title: `Membership Plan: ${m.planId}`,
            description: `Gateway Sub ID: ${m.gatewaySubscriptionId || "N/A"}`,
            status: m.status,
            createdAt: m.createdAt,
            metadata: { planId: m.planId, expiresAt: m.endDate },
          });
        });
      }

      // 4. Payments
      if (shouldSearch("payment")) {
        const payments = await prisma.payment.findMany({
          where: query
            ? {
                OR: [
                  { gatewayTransactionId: { contains: query, mode: "insensitive" } },
                ],
              }
            : {},
          take: limit,
        });
        payments.forEach((p) => {
          results.push({
            id: p.id,
            type: "payment",
            title: `Payment ${p.gatewayTransactionId || p.id}`,
            description: `Amount: INR ${p.amount}. Method: ${p.gateway || "N/A"}`,
            status: p.status,
            createdAt: p.createdAt,
            metadata: { gateway: p.gateway, amount: p.amount },
          });
        });
      }

      // 5. Transactions
      if (shouldSearch("transaction")) {
        const transactions = await prisma.transaction.findMany({
          where: query
            ? {
                description: { contains: query, mode: "insensitive" },
              }
            : {},
          take: limit,
        });
        transactions.forEach((t) => {
          results.push({
            id: t.id,
            type: "transaction",
            title: `Transaction ${t.id}`,
            description: t.description || "No transaction description.",
            status: t.type,
            createdAt: t.createdAt,
            metadata: { type: t.type, amount: t.amount },
          });
        });
      }

      // 6. CMS Pages & Blog Posts
      if (shouldSearch("cms_page") || shouldSearch("blog_post")) {
        const pages = await prisma.cmsPage.findMany({
          where: query
            ? {
                OR: [
                  { title: { contains: query, mode: "insensitive" } },
                  { slug: { contains: query, mode: "insensitive" } },
                  { content: { contains: query, mode: "insensitive" } },
                ],
              }
            : {},
          take: limit,
        });
        pages.forEach((p) => {
          const isBlog = p.slug.startsWith("blog-") || p.slug.includes("/blog");
          if (isBlog && shouldSearch("blog_post")) {
            results.push({
              id: p.id,
              type: "blog_post",
              title: p.title,
              description: p.content.substring(0, 100) + "...",
              status: p.status,
              createdAt: p.createdAt,
              metadata: { slug: p.slug },
            });
          } else if (!isBlog && shouldSearch("cms_page")) {
            results.push({
              id: p.id,
              type: "cms_page",
              title: p.title,
              description: p.content.substring(0, 100) + "...",
              status: p.status,
              createdAt: p.createdAt,
              metadata: { slug: p.slug },
            });
          }
        });
      }

      // 7. Audit Logs
      if (shouldSearch("audit_log")) {
        const audits = await prisma.auditLog.findMany({
          where: query
            ? {
                OR: [
                  { action: { contains: query, mode: "insensitive" } },
                  { details: { contains: query, mode: "insensitive" } },
                ],
              }
            : {},
          take: limit,
        });
        audits.forEach((a) => {
          results.push({
            id: a.id,
            type: "audit_log",
            title: `Audit: ${a.action}`,
            description: a.details || "No details provided.",
            status: "IMMUTABLE",
            createdAt: a.createdAt,
            metadata: { ip: a.ipAddress },
          });
        });
      }

      // 8. Fraud Cases
      if (shouldSearch("fraud_case")) {
        const cases = await prisma.fraudCase.findMany({
          where: query
            ? {
                OR: [
                  { reasons: { contains: query, mode: "insensitive" } },
                ],
              }
            : {},
          take: limit,
        });
        cases.forEach((c) => {
          results.push({
            id: c.id,
            type: "fraud_case",
            title: `Fraud Risk Case - Score: ${c.score}`,
            description: c.reasons,
            status: c.status,
            createdAt: c.detectedAt,
            metadata: { score: c.score },
          });
        });
      }

      // 9. Appeals
      if (shouldSearch("appeal")) {
        const appeals = await prisma.appeal.findMany({
          where: query
            ? {
                OR: [
                  { reason: { contains: query, mode: "insensitive" } },
                  { response: { contains: query, mode: "insensitive" } },
                ],
              }
            : {},
          take: limit,
        });
        appeals.forEach((a) => {
          results.push({
            id: a.id,
            type: "appeal",
            title: `Suspension Appeal for User ${a.userId}`,
            description: a.reason,
            status: a.status,
            createdAt: a.createdAt,
            metadata: { response: a.response },
          });
        });
      }

      // 10. Campaigns
      if (shouldSearch("campaign")) {
        const campaigns = await prisma.campaign.findMany({
          where: query
            ? {
                OR: [
                  { name: { contains: query, mode: "insensitive" } },
                  { content: { contains: query, mode: "insensitive" } },
                ],
              }
            : {},
          take: limit,
        });
        campaigns.forEach((c) => {
          results.push({
            id: c.id,
            type: "campaign",
            title: c.name,
            description: c.content.substring(0, 100),
            status: c.status,
            createdAt: c.createdAt,
            metadata: { type: c.type },
          });
        });
      }

      // 11. Coupons
      if (shouldSearch("coupon")) {
        const coupons = await prisma.coupon.findMany({
          where: query
            ? {
                OR: [
                  { code: { contains: query, mode: "insensitive" } },
                ],
              }
            : {},
          take: limit,
        });
        coupons.forEach((c) => {
          results.push({
            id: c.id,
            type: "coupon",
            title: `Coupon Code: ${c.code}`,
            description: `${c.discountType} discount of ${c.discountValue}`,
            status: c.isActive ? "ACTIVE" : "INACTIVE",
            createdAt: c.createdAt,
            metadata: { discountType: c.discountType, discountValue: c.discountValue },
          });
        });
      }

      // 12. Reports
      if (shouldSearch("report")) {
        const reports = await prisma.report.findMany({
          where: query
            ? {
                OR: [
                  { reason: { contains: query, mode: "insensitive" } },
                ],
              }
            : {},
          take: limit,
        });
        reports.forEach((r) => {
          results.push({
            id: r.id,
            type: "report",
            title: `Report filed against User ${r.reportedUserId}`,
            description: r.reason,
            status: r.status,
            createdAt: r.createdAt,
            metadata: { reporterId: r.reporterId },
          });
        });
      }

      // 13. Notifications
      if (shouldSearch("notification")) {
        const notifications = await prisma.notification.findMany({
          where: query
            ? {
                OR: [
                  { title: { contains: query, mode: "insensitive" } },
                  { message: { contains: query, mode: "insensitive" } },
                ],
              }
            : {},
          take: limit,
        });
        notifications.forEach((n) => {
          results.push({
            id: n.id,
            type: "notification",
            title: n.title,
            description: n.message,
            status: n.read ? "READ" : "UNREAD",
            createdAt: n.createdAt,
            metadata: { category: n.category },
          });
        });
      }
    } catch (err: any) {
      loggerService.error("Error executing global search in index repository", {}, err);
    }

    // Sort by createdAt DESC
    results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Slice to limit
    return results.slice(0, limit);
  }

  async saveSearchHistory(userId: string, term: string, filters?: any): Promise<void> {
    try {
      await prisma.savedSearch.create({
        data: {
          userId,
          name: `Search: ${term}`,
          filters: filters ? { query: term, ...filters } : { query: term },
        },
      });
    } catch (err: any) {
      loggerService.error("Failed to save search history", { userId, term }, err);
    }
  }

  async getSearchHistory(userId: string, limit: number = 10): Promise<any[]> {
    try {
      return prisma.savedSearch.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: limit,
      });
    } catch (err: any) {
      loggerService.error("Failed to get search history", { userId }, err);
      return [];
    }
  }

  async getSearchSuggestions(term: string): Promise<string[]> {
    if (!term || term.length < 2) return [];
    try {
      const users = await prisma.user.findMany({
        where: { name: { contains: term, mode: "insensitive" } },
        take: 3,
        select: { name: true },
      });
      const pages = await prisma.cmsPage.findMany({
        where: { title: { contains: term, mode: "insensitive" } },
        take: 3,
        select: { title: true },
      });
      const suggestions = [
        ...users.map((u) => u.name).filter(Boolean),
        ...pages.map((p) => p.title).filter(Boolean),
      ] as string[];
      return Array.from(new Set(suggestions)).slice(0, 5);
    } catch (err: any) {
      loggerService.error("Failed to fetch search suggestions", { term }, err);
      return [];
    }
  }
}
