import { loggerService } from "./logger.service";
import { Result, returnSuccess, returnFailure } from "../result";

export type SmsProviderName = "msg91" | "textlocal" | "twilio";
export type WhatsAppProviderName = "whatsapp_business_api" | "twilio_whatsapp";

export interface SmsMessage {
  to: string;
  message: string;
  templateId?: string;
}

export interface WhatsAppMessage {
  to: string;
  message: string;
  templateName?: string;
  templateParams?: Record<string, string>;
}

export class SmsWhatsappProvider {
  private activeSmsProvider: SmsProviderName = "twilio";
  private activeWhatsAppProvider: WhatsAppProviderName = "twilio_whatsapp";

  setProviders(sms: SmsProviderName, whatsapp: WhatsAppProviderName) {
    this.activeSmsProvider = sms;
    this.activeWhatsAppProvider = whatsapp;
  }

  async sendSms(msg: SmsMessage): Promise<Result<void>> {
    try {
      loggerService.info(`[SMS] Provider: ${this.activeSmsProvider} | To: ${msg.to} | Message: ${msg.message}`);

      switch (this.activeSmsProvider) {
        case "msg91":
          // MSG91 API call integration point
          break;
        case "textlocal":
          // TextLocal API call integration point
          break;
        case "twilio":
          // Twilio REST API integration point
          break;
        default:
          throw new Error("SMS provider not configured correctly.");
      }
      return returnSuccess(undefined);
    } catch (e: any) {
      return returnFailure(e.message, "SMS_SEND_ERROR");
    }
  }

  async sendWhatsApp(msg: WhatsAppMessage): Promise<Result<void>> {
    try {
      loggerService.info(`[WhatsApp] Provider: ${this.activeWhatsAppProvider} | To: ${msg.to} | Message: ${msg.message}`);

      switch (this.activeWhatsAppProvider) {
        case "whatsapp_business_api":
          // Meta WhatsApp Business API integration point
          break;
        case "twilio_whatsapp":
          // Twilio WhatsApp API integration point
          break;
        default:
          throw new Error("WhatsApp provider not configured correctly.");
      }
      return returnSuccess(undefined);
    } catch (e: any) {
      return returnFailure(e.message, "WHATSAPP_SEND_ERROR");
    }
  }
}

export const smsWhatsappProvider = new SmsWhatsappProvider();
