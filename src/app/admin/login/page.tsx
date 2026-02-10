"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useLanguage } from "@/components/language-context";
import { getCopy } from "@/lib/i18n";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { language } = useLanguage();
  const copy = getCopy(language);
  const [email, setEmail] = useState("neatcurb@gmail.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [recovering, setRecovering] = useState(false);

  const needsConfirm = (errorMessage: string | null) =>
    Boolean(errorMessage && errorMessage.toLowerCase().includes("not confirmed"));

  useEffect(() => {
    const err = params.get("error_code") || params.get("error");
    if (err && String(err).toLowerCase().includes("otp_expired")) {
      setError(copy.auth.recoveryExpired);
    }
  }, [params, copy.auth.recoveryExpired]);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    const userId = data.user?.id;
    if (userId) {
    const { data: profile } = await supabase
        .from("profiles")
        .select("must_change_password")
        .eq("id", userId)
        .maybeSingle();

      if (profile?.must_change_password) {
        router.replace("/admin/change-password");
      } else {
        router.replace("/admin");
      }
    } else {
      router.replace("/admin");
    }

    setLoading(false);
  };

  const handleResend = async () => {
    setError(null);
    setNotice(null);
    setResending(true);

    const { error } = await supabase.auth.resend({
      type: "signup",
      email
    });

    if (error) {
      setError(error.message);
      setResending(false);
      return;
    }

    setNotice(copy.auth.confirmSent);
    setResending(false);
  };

  const handleRecovery = async () => {
    setError(null);
    setNotice(null);
    setRecovering(true);

    const redirectTo = `${window.location.origin}/admin/change-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo
    });

    if (error) {
      setError(error.message);
      setRecovering(false);
      return;
    }

    setNotice(copy.auth.recoverySent);
    setRecovering(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <img
          src="/brand/neat-curb-logo-full.svg"
          alt="Neat Curb LLC logo"
          className="auth-logo"
        />
        <div className="auth-title">{copy.auth.signIn}</div>
        <div className="auth-sub">{copy.auth.adminAccess}</div>

        <form onSubmit={handleLogin} className="auth-form">
          <label className="form-field">
            {copy.auth.email}
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </label>
          <label className="form-field">
            {copy.auth.password}
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </label>
          {error ? <div className="auth-error">{error}</div> : null}
          {notice ? <div className="auth-notice">{notice}</div> : null}
          <button className="button-primary" type="submit" disabled={loading}>
            {loading ? copy.auth.signingIn : copy.auth.signInButton}
          </button>
          <button
            className="btn-secondary"
            type="button"
            disabled={recovering}
            onClick={handleRecovery}
            style={{ width: "100%", justifyContent: "center" }}
          >
            {recovering ? copy.auth.signingIn : copy.auth.sendRecovery}
          </button>
          {needsConfirm(error) ? (
            <button
              className="btn-secondary"
              type="button"
              disabled={resending}
              onClick={handleResend}
              style={{ width: "100%", justifyContent: "center" }}
            >
              {resending ? copy.auth.signingIn : copy.auth.resendConfirm}
            </button>
          ) : null}
          <a className="auth-home" href="/">
            {copy.auth.backHome}
          </a>
        </form>
      </div>
    </div>
  );
}
