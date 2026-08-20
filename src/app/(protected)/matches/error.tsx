"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";

export default function MatchesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Matches view error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-white rounded-2xl border border-rose-100 shadow-sm mx-4 my-8">
      <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-rose-500" />
      </div>
      <h2 className="text-xl font-bold text-slate-900 mb-2">
        Unable to load matches
      </h2>
      <p className="text-sm text-slate-500 mb-6 max-w-md">
        We encountered an unexpected issue while trying to load your match recommendations. 
      </p>
      <button
        onClick={() => reset()}
        className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-colors shadow-md shadow-rose-500/20"
      >
        <RefreshCcw className="w-4 h-4" />
        Try Again
      </button>
    </div>
  );
}
