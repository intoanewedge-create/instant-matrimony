import { NextResponse } from "next/server";
import { healthService } from "@/lib/services/health.service";

export async function GET() {
  try {
    const report = await healthService.getHealth();
    const status = report.status === "UP" ? 200 : 503;
    return NextResponse.json(report, { status });
  } catch (error: any) {
    return NextResponse.json(
      { status: "DOWN", error: error.message },
      { status: 500 }
    );
  }
}
