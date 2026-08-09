import { BaseService } from "./base.service";
import { Result, returnSuccess } from "../result";
import { IFeatureFlagRepository } from "../repositories/interfaces/feature-flag.repository";
import { CacheProvider } from "../cache/cache-provider";
import { FeatureFlagContext, FeatureFlagEvaluation } from "../domain/admin/contracts";
import { loggerService } from "./logger.service";

export class FeatureFlagService extends BaseService {
  constructor(
    private repository: IFeatureFlagRepository,
    private cache: CacheProvider
  ) {
    super();
  }

  async isEnabled(key: string, defaultValue: boolean = false, context?: FeatureFlagContext): Promise<Result<boolean>> {
    try {
      const envOverride = process.env[`FEATURE_FLAG_${key.toUpperCase()}`];
      if (envOverride !== undefined) {
        return this.returnSuccess(envOverride === "true");
      }

      // Check Cache (only simple flag caches; for complex context we fetch and evaluate)
      if (!context) {
        const cacheKey = `feature_flag:${key}`;
        const cached = await this.cache.get<boolean>(cacheKey);
        if (cached !== null) {
          return this.returnSuccess(cached);
        }
      }

      const flag = await this.repository.findByKey(key);
      if (!flag) {
        return this.returnSuccess(defaultValue);
      }

      if (!flag.enabled) {
        if (!context) {
          await this.cache.set(`feature_flag:${key}`, false, 1800, ["feature_flags"]);
        }
        return this.returnSuccess(false);
      }

      // Rules evaluation
      const evalRes = await this.evaluateFlagRules(flag, context);
      if (!context) {
        await this.cache.set(`feature_flag:${key}`, evalRes, 1800, ["feature_flags"]);
      }
      return this.returnSuccess(evalRes);
    } catch (e: any) {
      return this.returnFailure(e.message, "FEATURE_FLAG_CHECK_ERROR");
    }
  }

  private async evaluateFlagRules(flag: any, context?: FeatureFlagContext): Promise<boolean> {
    try {
      const valueStr = flag.value || "";
      if (!valueStr.trim().startsWith("{")) {
        // Plain string flag (e.g. "true" or "false")
        return valueStr === "true";
      }

      const parsed = JSON.parse(valueStr);
      if (!parsed.rules) return true;

      const rules = parsed.rules;

      // 1. Dependency Gates
      if (rules.dependencies && Array.isArray(rules.dependencies)) {
        for (const depKey of rules.dependencies) {
          const depRes = await this.isEnabled(depKey, false, context);
          if (!depRes.success || !depRes.data) {
            loggerService.info(`Feature flag ${flag.key} disabled: dependency ${depKey} is inactive.`);
            return false;
          }
        }
      }

      // 2. Kill Switch (Override)
      if (rules.killSwitch === true) {
        return false;
      }

      // 3. Environmental Targeting
      if (rules.environments && Array.isArray(rules.environments) && context?.environment) {
        if (!rules.environments.includes(context.environment)) {
          return false;
        }
      }

      // 4. Role Targeting
      if (rules.roles && Array.isArray(rules.roles) && context?.role) {
        if (!rules.roles.includes(context.role)) {
          return false;
        }
      }

      // 5. Premium Users targeting
      if (rules.isPremium !== undefined && context?.isPremium !== undefined) {
        if (rules.isPremium !== context.isPremium) {
          return false;
        }
      }

      // 6. Time Windows Scheduling
      const now = Date.now();
      if (rules.startTime) {
        const start = new Date(rules.startTime).getTime();
        if (now < start) return false;
      }
      if (rules.endTime) {
        const end = new Date(rules.endTime).getTime();
        if (now > end) return false;
      }

      // 7. Percentage Rollout
      if (rules.percentage !== undefined) {
        const pct = Number(rules.percentage);
        if (pct <= 0) return false;
        if (pct >= 100) return true;

        if (context?.userId) {
          // Stable hash function
          let hash = 0;
          const str = flag.key + context.userId;
          for (let i = 0; i < str.length; i++) {
            hash = (hash << 5) - hash + str.charCodeAt(i);
            hash |= 0;
          }
          const bucket = Math.abs(hash) % 100;
          if (bucket >= pct) return false;
        } else {
          // No user identity provided: default to false
          return false;
        }
      }

      return true;
    } catch (err: any) {
      loggerService.error(`Failed to evaluate rules for flag ${flag.key}`, {}, err);
      return false;
    }
  }

  async evaluateFlagDetails(key: string, context?: FeatureFlagContext): Promise<Result<FeatureFlagEvaluation>> {
    try {
      const flag = await this.repository.findByKey(key);
      if (!flag) {
        return this.returnFailure("Flag not found", "FLAG_NOT_FOUND");
      }

      const enabled = await this.evaluateFlagRules(flag, context);
      return returnSuccess({
        key,
        enabled: flag.enabled && enabled,
        value: flag.value,
        reason: flag.enabled
          ? enabled
            ? "All targeting and rollout rules passed."
            : "Targeting rules or percentage check failed."
          : "Flag is disabled globally via main toggle.",
      });
    } catch (e: any) {
      return this.returnFailure(e.message, "EVAL_FLAG_ERROR");
    }
  }

  async setFlag(
    key: string,
    enabled: boolean,
    value: string = "true",
    description?: string,
    category?: string,
    updatedBy: string = "admin"
  ): Promise<Result<any>> {
    try {
      // Manage rollback history within the JSON configuration if value is JSON
      let finalValue = value;
      if (value.trim().startsWith("{")) {
        try {
          const parsed = JSON.parse(value);
          if (!parsed.history) {
            parsed.history = [];
          }
          parsed.history.unshift({
            enabled,
            value: parsed.rules ? JSON.stringify(parsed.rules) : "true",
            updatedBy,
            updatedAt: new Date().toISOString(),
          });
          finalValue = JSON.stringify(parsed);
        } catch {
          // Ignore if parse fails
        }
      }

      const flag = await this.repository.upsert(key, enabled, finalValue, description, category);
      await this.cache.invalidateTags(["feature_flags"]);
      return this.returnSuccess(flag);
    } catch (e: any) {
      return this.returnFailure(e.message, "FEATURE_FLAG_SET_ERROR");
    }
  }

  async listFlags(): Promise<Result<any[]>> {
    try {
      const flags = await this.repository.listAll();
      return this.returnSuccess(flags);
    } catch (e: any) {
      return this.returnFailure(e.message, "FEATURE_FLAG_LIST_ERROR");
    }
  }

  async rollbackFlag(key: string, index: number, _updatedBy: string): Promise<Result<any>> {
    try {
      const flag = await this.repository.findByKey(key);
      if (!flag) {
        return this.returnFailure("Flag not found", "FLAG_NOT_FOUND");
      }

      const parsed = JSON.parse(flag.value);
      if (!parsed.history || !parsed.history[index]) {
        return this.returnFailure("Rollback snapshot not found", "SNAPSHOT_NOT_FOUND");
      }

      const snapshot = parsed.history[index];
      const newHistory = parsed.history.slice(index + 1);

      parsed.rules = snapshot.value.trim().startsWith("{") ? JSON.parse(snapshot.value) : undefined;
      parsed.history = newHistory;

      const updated = await this.repository.upsert(
        key,
        snapshot.enabled,
        JSON.stringify(parsed),
        flag.description || "",
        flag.category || ""
      );

      await this.cache.invalidateTags(["feature_flags"]);
      return returnSuccess(updated);
    } catch (e: any) {
      return this.returnFailure(e.message, "ROLLBACK_FLAG_ERROR");
    }
  }

  async seedDefaultFlags(): Promise<Result<void>> {
    try {
      const defaults = [
        { key: "registration", enabled: true, description: "Allows new users to register profiles", category: "Auth" },
        { key: "login", enabled: true, description: "Allows login to the application", category: "Auth" },
        { key: "payments", enabled: true, description: "Enables Stripe and Razorpay integrations", category: "Billing" },
        { key: "messaging", enabled: true, description: "Allows users to message matches in real time", category: "Chat" },
        { key: "otp", enabled: true, description: "Enables mock SMS and email OTP verification", category: "Auth" },
        { key: "emailVerification", enabled: true, description: "Mandates email verification for new accounts", category: "Auth" },
        { key: "phoneVerification", enabled: true, description: "Mandates OTP check on phone numbers", category: "Auth" },
        { key: "identityVerification", enabled: true, description: "Enables document verification pipeline", category: "Safety" },
        { key: "search", enabled: true, description: "Enables core partner search filters", category: "Matches" },
        { key: "recommendations", enabled: true, description: "Activates the weighted recommendation engine", category: "Matches" },
        { key: "premiumMembership", enabled: true, description: "Restricts matching features to active members", category: "Billing" },
        { key: "adminPanel", enabled: true, description: "Allows access to /admin workspace", category: "Management" },
        { key: "maintenanceMode", enabled: false, description: "Locks down front-facing application", category: "Management" },
      ];

      for (const item of defaults) {
        const existing = await this.repository.findByKey(item.key);
        if (!existing) {
          const configJson = {
            rules: { percentage: 100 },
            history: [{ enabled: item.enabled, value: "true", updatedBy: "system", updatedAt: new Date().toISOString() }],
          };
          await this.repository.upsert(item.key, item.enabled, JSON.stringify(configJson), item.description, item.category);
        }
      }
      await this.cache.invalidateTags(["feature_flags"]);
      return this.returnSuccess(undefined);
    } catch (e: any) {
      return this.returnFailure(e.message, "FEATURE_FLAG_SEED_ERROR");
    }
  }
}
