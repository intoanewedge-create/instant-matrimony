import { Settings } from "lucide-react";

export default function Maintenance() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center select-none">
      <div className="max-w-md bg-card border border-border/50 p-8 rounded-2xl shadow-sm flex flex-col items-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-6 animate-spin-slow">
          <Settings className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Under Maintenance</h1>
        <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
          InstantMatrimony is currently undergoing scheduled database optimizations. We will be back online shortly.
        </p>
      </div>
    </div>
  );
}
