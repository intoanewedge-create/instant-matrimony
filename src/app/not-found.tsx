import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center select-none">
      <div className="max-w-md bg-card border border-border/50 p-8 rounded-2xl shadow-sm flex flex-col items-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 mb-6">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">404 - Page Not Found</h1>
        <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
          The matrimonial profile or public page you are seeking does not exist or has been relocated.
        </p>
        <Link href="/" className="w-full mt-6">
          <Button className="w-full">Return Home</Button>
        </Link>
      </div>
    </div>
  );
}
