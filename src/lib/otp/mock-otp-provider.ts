import { OtpProvider } from "./otp-provider";
import { logger } from "../logger/logger";

export class MockOtpProvider implements OtpProvider {
  async sendOtp(target: string, code: string): Promise<void> {
    logger.info({ target, code }, `[MockOtpProvider] Sending OTP ${code} to ${target}`);
  }
}
