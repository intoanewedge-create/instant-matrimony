import { Result } from "../result";
import { PaymentStatus } from "@prisma/client";

export interface CreateCheckoutParams {
  orderId: string;
  amount: number;
  currency: string;
  successUrl: string;
  cancelUrl: string;
  userId: string;
  planName: string;
}

export interface CheckoutResult {
  sessionId: string;
  checkoutUrl: string;
  gatewayOrderId?: string;
}

export interface WebhookVerificationResult {
  isValid: boolean;
  event: string;
  payload: any;
  eventId: string;
}

export interface PaymentProvider {
  createCheckout(params: CreateCheckoutParams): Promise<Result<CheckoutResult>>;
  verifyWebhook(rawBody: string, signature: string): Promise<Result<WebhookVerificationResult>>;
  capturePayment(paymentId: string, amount: number): Promise<Result<any>>;
  refundPayment(gatewayTransactionId: string, amount: number): Promise<Result<{ refundId: string }>>;
  cancelSubscription(gatewaySubscriptionId: string): Promise<Result<boolean>>;
  getPaymentStatus(gatewayTransactionId: string): Promise<Result<PaymentStatus>>;
}
