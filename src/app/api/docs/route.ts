import { NextResponse } from "next/server";

export async function GET() {
  const openApiSpec = {
    openapi: "3.0.0",
    info: {
      title: "InstantMatrimony V2 Enterprise Commercial API",
      version: "2.0.0",
      description: "White-label enterprise matrimony REST & Server Action API reference.",
    },
    paths: {
      "/api/health": {
        get: {
          summary: "System Health & Diagnostics",
          responses: {
            "200": { description: "Health metrics status" },
          },
        },
      },
      "/api/v1/health": {
        get: {
          summary: "API v1 Health Endpoint",
          responses: {
            "200": { description: "OK" },
          },
        },
      },
    },
  };

  return NextResponse.json(openApiSpec);
}
