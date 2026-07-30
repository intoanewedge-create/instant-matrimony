import { logger } from "./logger";

export function logRequest(reqId: string, method: string, url: string, ip?: string, userId?: string) {
  logger.info({
    reqId,
    method,
    url,
    ip,
    userId,
    event: "request_started",
  }, `Incoming request: ${method} ${url}`);
}

export function logResponse(
  reqId: string,
  method: string,
  url: string,
  status: number,
  responseTimeMs: number,
  userId?: string
) {
  logger.info({
    reqId,
    method,
    url,
    status,
    responseTimeMs,
    userId,
    event: "request_finished",
  }, `Request finished: ${method} ${url} - ${status} (${responseTimeMs}ms)`);
}
