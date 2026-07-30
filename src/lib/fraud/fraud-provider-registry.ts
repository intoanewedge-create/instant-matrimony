import { FraudScoreDto } from "../domain/admin-contracts";
import { Result, returnSuccess, returnFailure } from "../result";
import { prisma } from "../prisma";

export interface FraudDetectionProvider {
  name(): string;
  analyzeUser(userId: string): Promise<Result<FraudScoreDto>>;
}

export class RuleBasedFraudProvider implements FraudDetectionProvider {
  name() {
    return "RuleBasedFraudProvider";
  }

  async analyzeUser(userId: string): Promise<Result<FraudScoreDto>> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          profile: true,
          sessionHistories: { take: 10, orderBy: { loginAt: "desc" } },
          messagesSent: { take: 50 },
        },
      });

      if (!user) {
        return returnFailure("User not found", "USER_NOT_FOUND");
      }

      let score = 0;
      const reasons: string[] = [];

      // 1. IP and Device sharing check
      const ips = user.sessionHistories.map((h) => h.ipAddress).filter(Boolean);
      const uniqueIps = new Set(ips);
      if (ips.length > 5 && uniqueIps.size === 1) {
        // High device continuity, but check if shared with other users
        const sharedIps = await prisma.userSessionHistory.findMany({
          where: { ipAddress: { in: ips as string[] }, userId: { not: userId } },
          select: { userId: true },
        });
        if (sharedIps.length > 0) {
          score += 30;
          reasons.push("IP address shared with other active accounts");
        }
      }

      // 2. High message sending rate check (spam warning)
      const lastHour = new Date(Date.now() - 60 * 60 * 1000);
      const sentCountInHour = user.messagesSent.filter((m) => new Date(m.createdAt) > lastHour).length;
      if (sentCountInHour > 30) {
        score += 40;
        reasons.push("High message sending frequency (potential spammer bot)");
      }

      // 3. Profile completeness & photo checks
      if (user.profile) {
        if (user.profile.completionPercent < 30) {
          score += 15;
          reasons.push("Low profile completion percentage");
        }
        if (!user.profile.city || !user.profile.country) {
          score += 10;
          reasons.push("Incomplete location details");
        }
      } else {
        score += 20;
        reasons.push("No profile associated with this account");
      }

      // Cap at 100
      score = Math.min(score, 100);
      const isHighRisk = score >= 75;

      return returnSuccess({
        userId,
        score,
        reasons,
        isHighRisk,
        autoSuspended: false, // Managed by service layer
      });
    } catch (e: any) {
      return returnFailure(e.message, "FRAUD_SCAN_ERROR");
    }
  }
}

export class FutureAiFraudProvider implements FraudDetectionProvider {
  name() {
    return "FutureAiFraudProvider";
  }

  async analyzeUser(userId: string): Promise<Result<FraudScoreDto>> {
    // Stub simulating high-dimension user activity scoring
    const ruleBased = new RuleBasedFraudProvider();
    const result = await ruleBased.analyzeUser(userId);
    if (!result.success || !result.data) return result;

    // AI boost: adds simulated threat scores for anomaly verification
    const val = result.data;
    if (val.score > 30) {
      val.score = Math.min(val.score + 10, 100);
      val.reasons.push("AI Anomaly detector: Suspicious behavioral fingerprint");
      val.isHighRisk = val.score >= 75;
    }

    return returnSuccess(val);
  }
}

export class FraudProviderRegistry {
  private providers: Map<string, FraudDetectionProvider> = new Map();
  private activeProviderName = "RuleBasedFraudProvider";

  registerProvider(provider: FraudDetectionProvider) {
    this.providers.set(provider.name(), provider);
  }

  setActiveProvider(name: string) {
    if (this.providers.has(name)) {
      this.activeProviderName = name;
    }
  }

  getActiveProvider(): FraudDetectionProvider {
    return this.providers.get(this.activeProviderName) || new RuleBasedFraudProvider();
  }

  async analyzeUserWithFallback(userId: string): Promise<Result<FraudScoreDto>> {
    const active = this.getActiveProvider();
    const res = await active.analyzeUser(userId);
    if (res.success) return res;

    // Fallback to RuleBased if AI failover happens
    if (active.name() !== "RuleBasedFraudProvider") {
      const fallback = this.providers.get("RuleBasedFraudProvider") || new RuleBasedFraudProvider();
      return fallback.analyzeUser(userId);
    }

    return res;
  }
}

export const fraudProviderRegistry = new FraudProviderRegistry();
fraudProviderRegistry.registerProvider(new RuleBasedFraudProvider());
fraudProviderRegistry.registerProvider(new FutureAiFraudProvider());
