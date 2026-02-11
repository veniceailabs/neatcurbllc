"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useLanguage } from "@/components/language-context";
import { getCopy } from "@/lib/i18n";

export default function ChangePasswordPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const copy = getCopy(language);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [recoveryExpired, setRecoveryExpired] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      // If the URL hash indicates an expired/invalid recovery link, do not bounce away.
      // Let the user see a clear message and go request a fresh link.
      if (typeof window !== "undefined") {
        const hash = window.location.hash || "";
        if (hash.toLowerCase().includes("error_code=otp_expired")) {
          setRecoveryExpired(true);
          setChecking(false);
          return;
        }
      }

      const { data } = await supabase.auth.getSession();
      if (cancelled) return;

      if (data.session) {
        setChecking(false);
        return;
      }

      // Recovery links can take a moment to hydrate the session from the URL.
      setTimeout(async () => {
        const { data: retry } = await supabase.auth.getSession();
        if (cancelled) return;
        if (retry.session) {
          setChecking(false);
          return;
        }
        // Don't auto-redirect; it hides useful context from the user (expired links, etc).
        setChecking(false);
      }, 800);
    };

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (cancelled) return;
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setChecking(false);
      }
    });

    check();
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [router]);

  const handleUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (password.length < 10) {
      setError(copy.auth.passwordMin);
      return;
    }
    if (password !== confirm) {
      setError(copy.auth.passwordMismatch);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    const userId = data.user?.id;
    if (userId) {
      await supabase
        .from("profiles")
        .update({ must_change_password: false })
        .eq("id", userId);
    }

    setLoading(false);
    router.replace("/admin");
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-title">{copy.auth.changePasswordTitle}</div>
        <div className="auth-sub">{copy.auth.changePasswordSub}</div>
        {checking ? (
          <div className="auth-notice">Checking secure session…</div>
        ) : null}
        {recoveryExpired ? (
          <div className="auth-error">
            Recovery link expired. Go back to Sign In and send a fresh reset email.
          </div>
        ) : null}
        <form onSubmit={handleUpdate} className="auth-form">
          {/* a11y: hidden username field to help password managers */}
          <input
            type="email"
            autoComplete="email"
            style={{ position: "absolute", left: "-9999px", height: 0, width: 0, opacity: 0 }}
            tabIndex={-1}
            aria-hidden="true"
          />
          <label className="form-field">
            {copy.auth.newPassword}
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              required
            />
          </label>
          <label className="form-field">
            {copy.auth.confirmPassword}
            <input
              type="password"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              autoComplete="new-password"
              required
            />
          </label>
          {error ? <div className="auth-error">{error}</div> : null}
          <button
            className="button-primary"
            type="submit"
            disabled={loading || recoveryExpired}
          >
            {loading ? copy.auth.updating : copy.auth.updatePassword}
          </button>
          <button
            className="btn-secondary"
            type="button"
            onClick={() => router.replace("/admin/login")}
            style={{ width: "100%", justifyContent: "center", marginTop: "10px" }}
          >
            Back to Sign In
          </button>
          {recoveryExpired ? (
            <button
              className="btn-secondary"
              type="button"
              onClick={() => router.replace("/admin/login")}
              style={{ width: "100%", justifyContent: "center" }}
            >
              Send A New Reset Link
            </button>
          ) : null}
        </form>
      </div>
    </div>
  );
}
