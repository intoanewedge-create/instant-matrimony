import { env } from "./env";

export const loggerConfig = {
  level: env.LOG_LEVEL,
  redactPaths: ["req.headers.authorization", "password", "token", "secret"],
};
