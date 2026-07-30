import { NextResponse } from "next/server";
import { healthService } from "@/lib/services/health.service";

export const dynamic = "force-dynamic";

export async function GET() {
  const health = await healthService.getHealth();
  const dbUp = health.services.database.status === "UP";
  const cacheUp = health.services.cache.status === "UP";

  if (dbUp && cacheUp) {
    return NextResponse.json({ status: "UP" }, { status: 200 });
  }
  return NextResponse.json({ 
    status: "DOWN", 
    database: health.services.database.status, 
    cache: health.services.cache.status 
  }, { status: 503 });
}
