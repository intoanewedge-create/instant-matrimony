import { prisma } from "../prisma";
import { Result, returnSuccess, returnFailure } from "../result";

export interface PluginDefinition {
  pluginKey: string;
  name: string;
  version: string;
  description: string;
  category: string;
}

export const AVAILABLE_PLUGINS: PluginDefinition[] = [
  { pluginKey: "horoscope_matching", name: "Astrology & Horoscope Matching", version: "1.0.0", description: "Kundli matching and Guna Milan scoring algorithms.", category: "Matchmaking" },
  { pluginKey: "video_profiles", name: "Video Profiles & Reels", version: "1.0.0", description: "Short video profile intros and media streaming support.", category: "Media" },
  { pluginKey: "ai_recommendations", name: "AI Matchmaker Engine", version: "1.0.0", description: "Deep learning AI recommendation engine for profile suggestions.", category: "AI & ML" },
  { pluginKey: "referral_program", name: "Referral & Reward System", version: "1.0.0", description: "Multi-tier referral credits and promo system.", category: "Marketing" },
  { pluginKey: "coupon_system", name: "Coupons & Discounts", version: "1.0.0", description: "Promo code engine for plan discounts.", category: "Billing" },
  { pluginKey: "franchise_module", name: "Matrimony Franchise Portal", version: "1.0.0", description: "Franchise agent dashboard for offline center registration.", category: "Enterprise" },
  { pluginKey: "mobile_api", name: "React Native / Flutter API Pack", version: "1.0.0", description: "REST API endpoints for native mobile app integration.", category: "Mobile" },
];

export class PluginManagerService {
  async seedPlugins(): Promise<Result<void>> {
    try {
      for (const p of AVAILABLE_PLUGINS) {
        const existing = await prisma.plugin.findUnique({ where: { pluginKey: p.pluginKey } });
        if (!existing) {
          await prisma.plugin.create({
            data: {
              pluginKey: p.pluginKey,
              name: p.name,
              version: p.version,
              description: p.description,
              isEnabled: false,
            },
          });
        }
      }
      return returnSuccess(undefined);
    } catch (e: any) {
      return returnFailure(e.message, "PLUGIN_SEED_ERROR");
    }
  }

  async getPlugins(): Promise<Result<any[]>> {
    try {
      await this.seedPlugins();
      const plugins = await prisma.plugin.findMany({ orderBy: { name: "asc" } });
      return returnSuccess(plugins);
    } catch (e: any) {
      return returnFailure(e.message, "GET_PLUGINS_ERROR");
    }
  }

  async togglePlugin(pluginKey: string, isEnabled: boolean): Promise<Result<any>> {
    try {
      const updated = await prisma.plugin.update({
        where: { pluginKey },
        data: { isEnabled },
      });
      return returnSuccess(updated);
    } catch (e: any) {
      return returnFailure(e.message, "TOGGLE_PLUGIN_ERROR");
    }
  }
}

export const pluginManagerService = new PluginManagerService();
