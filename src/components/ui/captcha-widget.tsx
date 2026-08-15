"use client";

import { useEffect, useState, useRef } from "react";
import { ShieldCheck, CheckCircle2, RefreshCw } from "lucide-react";

interface CaptchaWidgetProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: (err: string) => void;
}

export function CaptchaWidget({ onVerify, onExpire, onError }: CaptchaWidgetProps) {
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  const containerRef = useRef<HTMLDivElement>(null);

  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Dev / Fallback interactive checkbox state when env variables are not present
  const handleDevCheck = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setVerified(true);
      const devToken = `dev-token-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      onVerify(devToken);
    }, 600);
  };

  const handleDevReset = () => {
    setVerified(false);
    setErrorMsg(null);
    if (onExpire) onExpire();
  };

  useEffect(() => {
    if (!turnstileSiteKey || typeof window === "undefined") return;

    let widgetId: string | null = null;
    const scriptId = "turnstile-script";

    const renderWidget = () => {
      if ((window as any).turnstile && containerRef.current) {
        try {
          containerRef.current.innerHTML = "";
          widgetId = (window as any).turnstile.render(containerRef.current, {
            sitekey: turnstileSiteKey,
            callback: (token: string) => {
              setVerified(true);
              onVerify(token);
            },
            "expired-callback": () => {
              setVerified(false);
              if (onExpire) onExpire();
            },
            "error-callback": (err: any) => {
              setVerified(false);
              setErrorMsg("CAPTCHA verification failed");
              if (onError) onError("CAPTCHA error");
            },
          });
        } catch (e) {
          // ignore duplicate render errors
        }
      }
    };

    if (!(window as any).turnstile) {
      if (!document.getElementById(scriptId)) {
        const script = document.createElement("script");
        script.id = scriptId;
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback";
        script.async = true;
        script.defer = true;
        (window as any).onloadTurnstileCallback = renderWidget;
        document.head.appendChild(script);
      }
    } else {
      renderWidget();
    }

    return () => {
      if (widgetId && (window as any).turnstile) {
        try {
          (window as any).turnstile.remove(widgetId);
        } catch {}
      }
    };
  }, [turnstileSiteKey, onVerify, onExpire, onError]);

  if (turnstileSiteKey || recaptchaSiteKey) {
    return (
      <div className="space-y-1.5 py-1">
        <div ref={containerRef} className="flex justify-center min-h-[65px]" />
        {errorMsg && (
          <p className="text-xs text-red-500 text-center">{errorMsg}</p>
        )}
      </div>
    );
  }

  // Interactive local verification widget when site key is not configured in env
  return (
    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-rose-600" />
          <span className="font-semibold text-slate-800">Security Verification</span>
        </div>
        <span className="text-[10px] font-mono text-slate-400">Cloudflare Turnstile</span>
      </div>

      {!verified ? (
        <button
          type="button"
          onClick={handleDevCheck}
          disabled={loading}
          className="w-full flex items-center justify-between p-2.5 bg-white border border-slate-300 hover:border-rose-400 rounded-lg text-slate-700 hover:bg-rose-50/30 transition-all text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-4 h-4 rounded border-2 border-slate-400 bg-white flex items-center justify-center">
              {loading && <RefreshCw className="w-3 h-3 text-rose-600 animate-spin" />}
            </div>
            <span className="font-medium">I am not a robot</span>
          </div>
          <span className="text-[10px] text-slate-400">Verify identity</span>
        </button>
      ) : (
        <div className="flex items-center justify-between p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold text-xs">Verification Complete</span>
          </div>
          <button
            type="button"
            onClick={handleDevReset}
            className="text-[10px] text-slate-500 hover:text-slate-800 underline"
          >
            Reset
          </button>
        </div>
      )}
    </div>
  );
}
