"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useLanguage } from "@/components/language-context";
import { getCopy } from "@/lib/i18n";

export const dynamic = "force-dynamic";

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
  const [phase, setPhase] = useState<
    "unauthenticated" | "signing-in" | "provision-check" | "redirecting"
  >("unauthenticated");

  const needsConfirm = (errorMessage: string | null) =>
    Boolean(errorMessage && errorMessage.toLowerCase().includes("not confirmed"));

  useEffect(() => {
    const err = params.get("error_code") || params.get("error");
    if (err && String(err).toLowerCase().includes("otp_expired")) {
      setError(copy.auth.recoveryExpired);
    }
    const reason = params.get("reason");
    if (reason === "profile_missing") {
      setError(
        "Account exists but is not provisioned. Link this user in profiles as admin or staff."
      );
    } else if (reason === "forbidden") {
      setError("This account is not authorized for the admin dashboard.");
    }
  }, [params, copy.auth.recoveryExpired]);

  useEffect(() => {
    const checkExistingSession = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (!session) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("role,must_change_password")
        .eq("id", session.user.id)
        .maybeSingle();

      if (!profile) return;
      if (profile.must_change_password) {
        router.replace("/admin/change-password");
        return;
      }
      if (profile.role === "admin" || profile.role === "staff") {
        router.replace("/admin");
      }
    };

    void checkExistingSession();
  }, [router]);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);
    setPhase("signing-in");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      const status = (error as unknown as { status?: number }).status;
      setError(status ? `${error.message} (${status})` : error.message);
      setLoading(false);
      setPhase("unauthenticated");
      return;
    }

    const userId = data.user?.id;
    if (userId) {
      setPhase("provision-check");
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role,must_change_password")
        .eq("id", userId)
        .maybeSingle();

      // If the profile row isn't linked yet, the admin gate will bounce the user.
      // Fail fast with a clear message instead of "flashing" the dashboard.
      if (profileError || !profile) {
        await supabase.auth.signOut();
        setError(
          "Account is not provisioned yet (missing profile). Link this auth user to the profiles table as admin."
        );
        setLoading(false);
        setPhase("unauthenticated");
        return;
      }

      if (profile.role && profile.role !== "admin" && profile.role !== "staff") {
        await supabase.auth.signOut();
        setError("This account is not authorized for the admin dashboard.");
        setLoading(false);
        setPhase("unauthenticated");
        return;
      }

      setPhase("redirecting");
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

    // Use the current origin so Supabase redirects back to the exact host
    // the user is on (www vs apex). Make sure both are in Supabase Redirect URLs.
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
        <Image
          src="/brand/neat-curb-logo-full.svg"
          alt="Neat Curb LLC logo"
          className="auth-logo"
          width={120}
          height={90}
          priority
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
            {loading
              ? phase === "signing-in"
                ? copy.auth.signingIn
                : phase === "provision-check"
                  ? "Checking access..."
                  : "Redirecting..."
              : copy.auth.signInButton}
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
