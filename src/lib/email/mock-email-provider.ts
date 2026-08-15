import { EmailProvider } from "./email-provider";
import { logger } from "../logger/logger";
import { getRecipientDomain } from "./email-utils";
import { getEmailConfig } from "../../config/email.config";

export class MockEmailProvider implements EmailProvider {
  async send(to: string, subject: string, body: string): Promise<void> {
    const config = getEmailConfig();
    const recipientDomain = getRecipientDomain(to);

    logger.info(
      {
        provider: "mock",
        attempted: true,
        result: "SIMULATED",
        recipientDomain,
        sender: config.from,
        subject,
      },
      "[MockEmailProvider] Simulated email dispatch successfully."
    );
  }
}
