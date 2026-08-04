import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function BlogIndexPage() {
  const posts = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Matrimony Blog & Relationship Guides</h1>
        <p className="text-muted-foreground mt-2">Tips on finding your ideal life partner, relationship advice, and success stories.</p>
      </div>

      {posts.length === 0 ? (
        <div className="p-12 text-center border rounded-lg bg-muted/20 text-muted-foreground">
          No blog posts published yet. Check back soon!
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {posts.map((post) => (
            <div key={post.id} className="border rounded-xl p-5 space-y-3 hover:shadow-lg transition-shadow">
              <span className="bg-primary/10 text-primary text-xs font-semibold px-2.5 py-1 rounded-full">
                {post.category}
              </span>
              <h2 className="text-xl font-bold line-clamp-2">
                <Link href={`/blog/${post.slug}`} className="hover:underline">
                  {post.title}
                </Link>
              </h2>
              <p className="text-sm text-muted-foreground line-clamp-3">{post.summary}</p>
              <div className="pt-2 text-xs text-muted-foreground flex justify-between">
                <span>By {post.authorName}</span>
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
