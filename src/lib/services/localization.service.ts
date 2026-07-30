import { BaseService } from "./base.service";
import { logger } from "../logger";

export interface LocalePack {
  [key: string]: string;
}

/**
 * Enterprise Localization & Internationalization Service.
 * Formats dates, currencies, and timestamps under target timezone constraints.
 * Resolves localized strings for web notifications and SMS templates.
 */
export class LocalizationService extends BaseService {
  private static languages = new Map<string, LocalePack>();

  static {
    // English language pack
    LocalizationService.languages.set("en", {
      welcome: "Welcome to InstantMatrimony!",
      match_found: "New partner match found: {name}!",
      payment_success: "Your payment of {amount} succeeded."
    });

    // Spanish language pack
    LocalizationService.languages.set("es", {
      welcome: "¡Bienvenido a InstantMatrimony!",
      match_found: "Nueva coincidencia de pareja encontrada: {name}!",
      payment_success: "Su pago de {amount} se realizó con éxito."
    });

    // Hindi language pack
    LocalizationService.languages.set("hi", {
      welcome: "इंस्टेंट मैट्रिमोनी में आपका स्वागत है!",
      match_found: "नया पार्टनर मिला: {name}!",
      payment_success: "आपका भुगतान {amount} सफल रहा।"
    });
  }

  /**
   * Resolves a key to its localized template string, replacing parameter tokens.
   *
   * @param key - The translation key.
   * @param locale - Target locale (e.g. en, es, hi).
   * @param params - Variables to inject into templates.
   */
  public translate(key: string, locale = "en", params?: Record<string, string | number>): string {
    const pack = LocalizationService.languages.get(locale.toLowerCase()) || LocalizationService.languages.get("en")!;
    let template = pack[key];

    if (!template) {
      logger.warn(`[LocalizationService] Missing translation key ${key} for locale ${locale}`);
      return key;
    }

    if (params) {
      Object.entries(params).forEach(([paramKey, value]) => {
        template = template.replace(new RegExp(`{${paramKey}}`, "g"), String(value));
      });
    }

    return template;
  }

  /**
   * Formats a date object to local date format.
   */
  public formatDate(date: Date, locale = "en-US", timeZone = "UTC"): string {
    try {
      return new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone
      }).format(date);
    } catch (err: any) {
      logger.error(`[LocalizationService] Failed to format date: ${err.message}`);
      return date.toISOString();
    }
  }

  /**
   * Formats a currency value localized.
   */
  public formatCurrency(amount: number, currency = "USD", locale = "en-US"): string {
    try {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency
      }).format(amount);
    } catch (err: any) {
      logger.error(`[LocalizationService] Failed to format currency: ${err.message}`);
      return `${currency} ${amount}`;
    }
  }
}
export const localizationService = new LocalizationService();
export default localizationService;
