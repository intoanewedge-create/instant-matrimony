import { handlers } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function GET(req: Request) {
  const nextReq = req instanceof NextRequest ? req : new NextRequest(req.url, req);
  return handlers.GET(nextReq);
}

export async function POST(req: Request) {
  const nextReq = req instanceof NextRequest ? req : new NextRequest(req.url, req);
  return handlers.POST(nextReq);
}
