import { NextRequest, NextResponse } from "next/server";
import { container } from "@/lib/container";
import { logger } from "@/lib/logger/logger";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const headers = req.headers;

  const stripeSignature = headers.get("stripe-signature");
  const razorpaySignature = headers.get("x-razorpay-signature");

  let providerType: "STRIPE" | "RAZORPAY" | "MOCK" = "MOCK";
  let signature = "";
  let gatewayEventId = `mock_event_${Date.now()}`;
  let eventType = "unknown";

  try {
    const payload = JSON.parse(rawBody || "{}");

    if (stripeSignature) {
      providerType = "STRIPE";
      signature = stripeSignature;
      gatewayEventId = payload.id || gatewayEventId;
      eventType = payload.type || eventType;
    } else if (razorpaySignature) {
      providerType = "RAZORPAY";
      signature = razorpaySignature;
      gatewayEventId = payload.payload?.payment?.entity?.id || gatewayEventId;
      eventType = payload.event || eventType;
    } else {
      gatewayEventId = payload.id || gatewayEventId;
      eventType = payload.event || eventType;
    }

    const webhookRepo = container.repositories.webhookRepository;

    const existing = await webhookRepo.findEventByProviderAndId(providerType, gatewayEventId);
    if (existing) {
      logger.info({ gatewayEventId }, "Webhook event already processed (deduplicated)");
      return NextResponse.json({ success: true, message: "Duplicate event" }, { status: 200 });
    }

    const dbEvent = await webhookRepo.createEvent({
      provider: providerType,
      eventId: gatewayEventId,
      eventType,
      payload,
      status: "PENDING",
    });

    const result = await container.services.billingAggregate.handleWebhook(rawBody, signature);

    if (result.success) {
      await webhookRepo.updateEventStatus(dbEvent.id, "PROCESSED");
      await webhookRepo.createLog({
        eventId: dbEvent.id,
        status: "PROCESSED",
        message: "Webhook processed successfully",
      });
      return NextResponse.json({ success: true }, { status: 200 });
    } else {
      await webhookRepo.updateEventStatus(dbEvent.id, "FAILED");
      await webhookRepo.createLog({
        eventId: dbEvent.id,
        status: "FAILED",
        message: result.error || "Processing failed",
      });
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }
  } catch (err: any) {
    logger.error(err, "Error in webhook API handler");
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
