import { Loader2 } from "lucide-react";

export default function SearchLoading() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] space-y-4">
      <div className="relative">
        <div className="absolute inset-0 bg-rose-200 rounded-full blur-xl opacity-50 animate-pulse"></div>
        <Loader2 className="w-10 h-10 text-rose-600 animate-spin relative z-10" />
      </div>
      <p className="text-sm font-medium text-slate-500 animate-pulse">
        Loading search results...
      </p>
    </div>
  );
}
