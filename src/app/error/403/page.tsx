import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";

export default function Forbidden() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center select-none">
      <div className="max-w-md bg-card border border-border/50 p-8 rounded-2xl shadow-sm flex flex-col items-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-600 mb-6">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">403 - Access Forbidden</h1>
        <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
          You do not have the required administrative permissions to access the operator console.
        </p>
        <Link href="/" className="w-full mt-6">
          <Button className="w-full">Return Home</Button>
        </Link>
      </div>
    </div>
  );
}
