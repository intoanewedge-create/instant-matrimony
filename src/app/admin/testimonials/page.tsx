import { prisma } from "@/lib/prisma";
import { AdminTestimonialsClient } from "./admin-testimonials-client";

export const dynamic = "force-dynamic";

export default async function AdminTestimonialsPage() {
  let testimonials: any[] = [];
  try {
    testimonials = await prisma.testimonial.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });
  } catch (error) {
    console.error("AdminTestimonialsPage error loading from database:", error);
  }
  return <AdminTestimonialsClient initialTestimonials={JSON.parse(JSON.stringify(testimonials))} />;
}

