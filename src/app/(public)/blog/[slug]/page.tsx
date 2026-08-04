import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function BlogPostDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const post = await prisma.blogPost.findUnique({
    where: { slug: resolvedParams.slug },
  });

  if (!post || post.status !== "PUBLISHED") {
    notFound();
  }

  return (
    <article className="max-w-4xl mx-auto px-4 py-12 space-y-6">
      <div className="space-y-2">
        <span className="bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full">
          {post.category}
        </span>
        <h1 className="text-4xl font-extrabold tracking-tight">{post.title}</h1>
        <div className="text-sm text-muted-foreground flex gap-4 pt-1">
          <span>By {post.authorName}</span>
          <span>•</span>
          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="prose max-w-none text-muted-foreground border-t pt-6">
        <p className="text-lg leading-relaxed">{post.content}</p>
      </div>
    </article>
  );
}
