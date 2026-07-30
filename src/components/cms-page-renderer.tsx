import React from "react";

export function CmsPageRenderer({ title, content, seoTitle }: { title: string; content: string; seoTitle?: string | null }) {
  const parseContent = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      const trimmed = line.trim();

      if (trimmed.startsWith("# ")) {
        return <h1 key={idx} className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground mt-8 mb-4">{trimmed.replace("# ", "")}</h1>;
      }
      if (trimmed.startsWith("## ")) {
        return <h2 key={idx} className="text-2xl font-bold tracking-tight text-foreground mt-6 mb-3">{trimmed.replace("## ", "")}</h2>;
      }
      if (trimmed.startsWith("### ")) {
        return <h3 key={idx} className="text-xl font-semibold tracking-tight text-foreground mt-4 mb-2">{trimmed.replace("### ", "")}</h3>;
      }
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        const cleanText = trimmed.substring(2);
        return (
          <ul key={idx} className="list-disc pl-6 my-2 text-sm sm:text-base text-muted-foreground leading-relaxed">
            <li>{renderBold(cleanText)}</li>
          </ul>
        );
      }
      if (trimmed === "") {
        return <div key={idx} className="h-4" />;
      }
      return (
        <p key={idx} className="text-sm sm:text-base text-muted-foreground leading-relaxed my-3">
          {renderBold(trimmed)}
        </p>
      );
    });
  };

  const renderBold = (text: string) => {
    const parts = text.split("**");
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return <strong key={i} className="font-semibold text-foreground">{part}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="flex flex-col w-full py-16 sm:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 bg-card border border-border/40 p-8 sm:p-12 rounded-3xl shadow-sm">
        <div className="border-b border-border/10 pb-6 mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            {seoTitle || title}
          </h1>
        </div>
        <div className="prose dark:prose-invert max-w-none">
          {parseContent(content)}
        </div>
      </div>
    </div>
  );
}
