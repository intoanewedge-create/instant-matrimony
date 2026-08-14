import { prisma } from "@/lib/prisma";
import { AdminFaqsClient } from "./admin-faqs-client";

export const dynamic = "force-dynamic";

export default async function AdminFaqsPage() {
  let faqs: any[] = [];
  try {
    faqs = await prisma.fAQ.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });
  } catch (error) {
    console.error("AdminFaqsPage error loading from database:", error);
  }
  return <AdminFaqsClient initialFaqs={JSON.parse(JSON.stringify(faqs))} />;
}

