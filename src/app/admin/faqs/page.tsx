import { prisma } from "@/lib/prisma";
import { AdminFaqsClient } from "./admin-faqs-client";

export const dynamic = "force-dynamic";

export default async function AdminFaqsPage() {
  try {
    const faqs = await prisma.fAQ.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });
    return <AdminFaqsClient initialFaqs={JSON.parse(JSON.stringify(faqs))} />;
  } catch (error) {
    console.error("AdminFaqsPage error loading from database:", error);
    return <AdminFaqsClient initialFaqs={[]} />;
  }
}
