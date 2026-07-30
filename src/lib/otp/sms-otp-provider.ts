import { OtpProvider } from "./otp-provider";
import { smsConfig } from "../../config/sms.config";
import { logger } from "../logger/logger";

export class SmsOtpProvider implements OtpProvider {
  async sendOtp(target: string, code: string): Promise<void> {
    const { accountSid, authToken, fromNumber } = smsConfig.twilio;

    if (smsConfig.provider === "mock" || !accountSid || !authToken || !fromNumber) {
      logger.info({ target, code }, `[SmsOtpProvider (Mock)] OTP ${code} would be sent to phone ${target}`);
      return;
    }

    try {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
      const basicAuth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Basic ${basicAuth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          From: fromNumber,
          To: target,
          Body: `Your InstantMatrimony verification OTP is ${code}. Valid for 10 minutes.`,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error({ target, status: response.status, errorText }, "Twilio API returned error response");
        throw new Error(`Twilio API error: ${response.statusText}`);
      }

      logger.info({ target }, "SMS OTP sent successfully via Twilio");
    } catch (error: any) {
      logger.error({ target, error: error.message }, "Failed to send SMS OTP via Twilio");
      throw error;
    }
  }
}
