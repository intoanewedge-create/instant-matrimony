"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex-1 p-6 md:p-8 flex items-center justify-center bg-slate-50/50">
      <div className="max-w-md w-full bg-white border border-rose-100 rounded-xl shadow-sm p-6 flex flex-col items-center text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 mb-2">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900">
          Something went wrong!
        </h2>
        <p className="text-sm text-slate-500 pb-2">
          We encountered an unexpected error while loading this data.
        </p>
        <button
          onClick={() => reset()}
          className="w-full flex items-center justify-center px-4 py-2 border border-rose-200 rounded-lg text-rose-700 hover:bg-rose-50 hover:text-rose-800 transition-colors"
        >
          <RefreshCcw className="w-4 h-4 mr-2" />
          Try again
        </button>
      </div>
    </div>
  );
}
