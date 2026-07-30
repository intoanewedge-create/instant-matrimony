import { BaseService } from "./base.service";
import { Result, returnSuccess } from "../result";

/**
 * Service managing real-time session risk calculations, geolocation check jumps, and adaptive restrictions.
 */
export class SessionRiskService extends BaseService {
  private lastSessionLocations = new Map<string, { ip: string; country: string; timestamp: Date }>();

  /**
   * Asserts if consecutive login records violate physically possible velocity bounds.
   */
  async assessSessionRisk(userId: string, currentIp: string, currentCountry: string): Promise<Result<{ riskScore: number; reason?: string }>> {
    const lastSession = this.lastSessionLocations.get(userId);
    const now = new Date();

    this.lastSessionLocations.set(userId, { ip: currentIp, country: currentCountry, timestamp: now });

    if (lastSession) {
      const timeDiffMinutes = (now.getTime() - lastSession.timestamp.getTime()) / 60000;
      if (lastSession.country !== currentCountry && timeDiffMinutes < 60) {
        // Impossible travel anomaly
        return returnSuccess({
          riskScore: 95,
          reason: `Impossible travel detected: country changed from ${lastSession.country} to ${currentCountry} in ${Math.round(timeDiffMinutes)} minutes.`
        });
      }
    }

    return returnSuccess({
      riskScore: 10
    });
  }
}
