import { NextResponse } from "next/server";
import { healthService } from "@/lib/services/health.service";

export const dynamic = "force-dynamic";

export async function GET() {
  const health = await healthService.getHealth();
  const status = health.status === "UP" ? 200 : 503;
  return NextResponse.json(health, { status });
}
