import pino from "pino";
import { loggerConfig } from "@/config/logger.config";
import { appConfig } from "@/config/app.config";

const isProduction = appConfig.env === "production";

export const logger = pino({
  level: loggerConfig.level,
  redact: {
    paths: loggerConfig.redactPaths,
    censor: "**REDACTED**",
  },
  transport: !isProduction
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          ignore: "pid,hostname",
          translateTime: "SYS:standard",
        },
      }
    : undefined,
});
