import { logger } from "../logger/logger";

export type LogLevel = "TRACE" | "DEBUG" | "INFO" | "WARN" | "ERROR" | "FATAL";

export class LoggerService {
  private levelWeights: Record<LogLevel, number> = {
    TRACE: 10,
    DEBUG: 20,
    INFO: 30,
    WARN: 40,
    ERROR: 50,
    FATAL: 60,
  };

  private currentLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || "INFO";

  private maskFields = [
    "password",
    "passwordConfirm",
    "otp",
    "otpCode",
    "token",
    "jwt",
    "apiKey",
    "aadhaar",
    "pan",
    "cardNumber",
    "cvv",
    "paymentToken",
  ];

  private shouldLog(level: LogLevel): boolean {
    return this.levelWeights[level] >= this.levelWeights[this.currentLevel];
  }

  private maskData(data: any): any {
    if (!data) return data;
    if (typeof data !== "object") return data;

    try {
      const cloned = JSON.parse(JSON.stringify(data));
      const mask = (obj: any) => {
        for (const key in obj) {
          if (this.maskFields.some((f) => key.toLowerCase().includes(f))) {
            obj[key] = "**REDACTED**";
          } else if (obj[key] && typeof obj[key] === "object") {
            mask(obj[key]);
          }
        }
      };
      mask(cloned);
      return cloned;
    } catch {
      return data;
    }
  }

  trace(msg: string, context?: any) {
    if (!this.shouldLog("TRACE")) return;
    logger.trace(this.maskData(context) || {}, msg);
  }

  debug(msg: string, context?: any) {
    if (!this.shouldLog("DEBUG")) return;
    logger.debug(this.maskData(context) || {}, msg);
  }

  info(msg: string, context?: any) {
    if (!this.shouldLog("INFO")) return;
    logger.info(this.maskData(context) || {}, msg);
  }

  warn(msg: string, context?: any) {
    if (!this.shouldLog("WARN")) return;
    logger.warn(this.maskData(context) || {}, msg);
  }

  error(msg: string, context?: any, err?: any) {
    if (!this.shouldLog("ERROR")) return;
    logger.error({ ...this.maskData(context), error: err?.message || err }, msg);
  }

  fatal(msg: string, context?: any, err?: any) {
    if (!this.shouldLog("FATAL")) return;
    logger.fatal({ ...this.maskData(context), error: err?.message || err }, msg);
  }
}

export const loggerService = new LoggerService();
