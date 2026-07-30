import { EmailProvider } from "./email-provider";
import { logger } from "../logger/logger";

export class MockEmailProvider implements EmailProvider {
  async send(to: string, subject: string, body: string): Promise<void> {
    logger.info({ to, subject, body }, `[MockEmailProvider] Sending Email successfully.`);
  }
}
