"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, RefreshCw, CheckCircle2 } from "lucide-react";
import { getCaptchaAction } from "@/lib/actions/auth.actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CaptchaWidgetProps {
  onVerify: (token: string, code?: string) => void;
  onExpire?: () => void;
  onError?: (err: string) => void;
}

export function CaptchaWidget({ onVerify }: CaptchaWidgetProps) {
  const [captchaData, setCaptchaData] = useState<{ token: string; svgDataUri: string } | null>(null);
  const [inputCode, setInputCode] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchCaptcha = async () => {
    setLoading(true);
    setInputCode("");
    try {
      const res = await getCaptchaAction();
      if (res.success && res.token && res.svgDataUri) {
        setCaptchaData({ token: res.token, svgDataUri: res.svgDataUri });
        onVerify(res.token, "");
      }
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCaptcha();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase().slice(0, 6);
    setInputCode(val);
    if (captchaData) {
      onVerify(captchaData.token, val);
    }
  };

  return (
    <div className="p-3 bg-slate-50 border border-slate-200/90 rounded-xl space-y-3 text-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-rose-600" />
          <span className="font-bold text-slate-800">Security Verification (CAPTCHA)</span>
        </div>
        <span className="text-[10px] font-mono text-slate-400">Human Check</span>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative border border-slate-200 rounded-lg overflow-hidden bg-white shrink-0 shadow-sm flex items-center">
          {captchaData ? (
            <img
              src={captchaData.svgDataUri}
              alt="CAPTCHA Challenge"
              className="h-[42px] w-[140px] object-contain"
            />
          ) : (
            <div className="h-[42px] w-[140px] flex items-center justify-center bg-slate-100 text-slate-400 text-xs">
              Loading...
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={fetchCaptcha}
          disabled={loading}
          className="p-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 hover:text-rose-600 transition-all focus:outline-none"
          title="Refresh CAPTCHA"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-rose-600" : ""}`} />
        </button>
      </div>

      <div className="space-y-1">
        <Label htmlFor="captchaCode" className="text-[11px] font-semibold text-slate-600">
          Enter CAPTCHA characters shown above *
        </Label>
        <Input
          id="captchaCode"
          name="captchaCode"
          placeholder="Enter 6 characters"
          maxLength={6}
          value={inputCode}
          onChange={handleInputChange}
          className="bg-white border-slate-200 text-slate-900 font-mono tracking-widest text-sm font-bold uppercase h-9 focus-visible:ring-rose-500"
        />
      </div>
    </div>
  );
}
