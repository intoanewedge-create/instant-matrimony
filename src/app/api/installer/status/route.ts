import { NextResponse } from "next/server";
import { setupWizardService } from "@/lib/services/setup-wizard.service";

export const dynamic = "force-dynamic";

export async function GET() {
  const isInstalled = await setupWizardService.isInstalled();
  return NextResponse.json({ isInstalled });
}
