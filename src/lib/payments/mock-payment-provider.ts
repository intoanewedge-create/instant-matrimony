import { PaymentProvider, CreateCheckoutParams, CheckoutResult, WebhookVerificationResult } from "./payment-provider";
import { Result } from "../result";
import { PaymentStatus } from "@prisma/client";

export class MockPaymentProvider implements PaymentProvider {
  async createCheckout(params: CreateCheckoutParams): Promise<Result<CheckoutResult>> {
    const sessionId = `mock_sess_${Date.now()}`;
    const checkoutUrl = `/dashboard/billing?session_id=${sessionId}&order_id=${params.orderId}&amount=${params.amount}`;
    return {
      success: true,
      data: {
        sessionId,
        checkoutUrl,
        gatewayOrderId: `mock_order_${Date.now()}`,
      },
    };
  }

  async verifyWebhook(rawBody: string, signature: string): Promise<Result<WebhookVerificationResult>> {
    try {
      const payload = JSON.parse(rawBody);
      return {
        success: true,
        data: {
          isValid: true,
          event: payload.event || "payment.captured",
          payload,
          eventId: payload.id || `mock_evt_${Date.now()}`,
        },
      };
    } catch (e: any) {
      return { success: false, error: "Invalid JSON payload" };
    }
  }

  async capturePayment(paymentId: string, amount: number): Promise<Result<any>> {
    return { success: true, data: { captured: true, amount } };
  }

  async refundPayment(gatewayTransactionId: string, amount: number): Promise<Result<{ refundId: string }>> {
    return {
      success: true,
      data: { refundId: `mock_ref_${Date.now()}` },
    };
  }

  async cancelSubscription(gatewaySubscriptionId: string): Promise<Result<boolean>> {
    return { success: true, data: true };
  }

  async getPaymentStatus(gatewayTransactionId: string): Promise<Result<PaymentStatus>> {
    return { success: true, data: PaymentStatus.PAID };
  }
}
