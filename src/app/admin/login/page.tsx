"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useLanguage } from "@/components/language-context";
import { getCopy } from "@/lib/i18n";

export const dynamic = "force-dynamic";

const OWNER_RECOVERY_ALLOWLIST = new Set([
  "neatcurb@gmail.com",
  "andrakennerjr@going-digital.org"
]);

const normalizeEmail = (value?: string | null) => (value || "").trim().toLowerCase();

export default function LoginPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const copy = getCopy(language);
  const [email, setEmail] = useState("neatcurb@gmail.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [recovering, setRecovering] = useState(false);
  const [magicLoading, setMagicLoading] = useState(false);
  const [rescueLoading, setRescueLoading] = useState(false);
  const [phase, setPhase] = useState<
    "unauthenticated" | "signing-in" | "provision-check" | "redirecting"
  >("unauthenticated");

  const needsConfirm = (errorMessage: string | null) =>
    Boolean(errorMessage && errorMessage.toLowerCase().includes("not confirmed"));
  const isOwnerRecoveryEmail = OWNER_RECOVERY_ALLOWLIST.has(normalizeEmail(email));

  const runOwnerRescue = async (targetEmail: string) => {
    const normalized = normalizeEmail(targetEmail);
    if (!OWNER_RECOVERY_ALLOWLIST.has(normalized)) return false;
    const response = await fetch("/api/public/account-rescue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: normalized })
    });
    return response.ok;
  };

  useEffect(() => {
    const query =
      typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
    const err = query?.get("error_code") || query?.get("error");
    if (err && String(err).toLowerCase().includes("otp_expired")) {
      setError(copy.auth.recoveryExpired);
    }
    const reason = query?.get("reason");
    if (reason === "profile_missing") {
      setError(copy.auth.profileMissing);
    } else if (reason === "forbidden") {
      setError(copy.auth.unauthorized);
    }
  }, [copy.auth.profileMissing, copy.auth.recoveryExpired, copy.auth.unauthorized]);

  useEffect(() => {
    const checkExistingSession = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (!session) return;

      const sessionEmail = normalizeEmail(session.user.email);
      let { data: profile } = await supabase
        .from("profiles")
        .select("role,must_change_password")
        .eq("id", session.user.id)
        .maybeSingle();

      if (!profile && OWNER_RECOVERY_ALLOWLIST.has(sessionEmail)) {
        await runOwnerRescue(sessionEmail);
        const retry = await supabase
          .from("profiles")
          .select("role,must_change_password")
          .eq("id", session.user.id)
          .maybeSingle();
        profile = retry.data;
      }

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
        const recovered = await runOwnerRescue(email);
        if (recovered) {
          const retry = await supabase
            .from("profiles")
            .select("role,must_change_password")
            .eq("id", userId)
            .maybeSingle();
          if (retry.data) {
            setPhase("redirecting");
            if (retry.data.must_change_password) {
              router.replace("/admin/change-password");
            } else {
              router.replace("/admin");
            }
            setLoading(false);
            return;
          }
        }

        await supabase.auth.signOut();
        setError(copy.auth.profileMissing);
        setLoading(false);
        setPhase("unauthenticated");
        return;
      }

      if (profile.role && profile.role !== "admin" && profile.role !== "staff") {
        const recovered = await runOwnerRescue(email);
        if (recovered) {
          const retry = await supabase
            .from("profiles")
            .select("role,must_change_password")
            .eq("id", userId)
            .maybeSingle();
          if (retry.data?.role === "admin" || retry.data?.role === "staff") {
            setPhase("redirecting");
            if (retry.data.must_change_password) {
              router.replace("/admin/change-password");
            } else {
              router.replace("/admin");
            }
            setLoading(false);
            return;
          }
        }

        await supabase.auth.signOut();
        setError(copy.auth.unauthorized);
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
    if (typeof window !== "undefined") {
      window.localStorage.setItem("neatcurb:last-login-email", email);
    }
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

  const handleMagicLink = async () => {
    setError(null);
    setNotice(null);
    setMagicLoading(true);

    if (typeof window !== "undefined") {
      window.localStorage.setItem("neatcurb:last-login-email", email);
    }

    const redirectTo = `${window.location.origin}/admin/login`;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo }
    });

    if (error) {
      setError(error.message);
      setMagicLoading(false);
      return;
    }

    setNotice("Magic sign-in link sent. Open it immediately from your inbox.");
    setMagicLoading(false);
  };

  const handleOwnerRescue = async () => {
    setError(null);
    setNotice(null);
    setRescueLoading(true);
    const rescued = await runOwnerRescue(email);
    if (!rescued) {
      setError("Owner rescue unavailable for this email.");
      setRescueLoading(false);
      return;
    }
    setNotice("Owner account rescue applied. Try signing in again now.");
    setRescueLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Image
          src="/brand/neat-curb-logo-full.png"
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
                  ? copy.auth.checkingAccess
                  : copy.auth.redirecting
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
          <button
            className="btn-secondary"
            type="button"
            disabled={magicLoading}
            onClick={handleMagicLink}
            style={{ width: "100%", justifyContent: "center" }}
          >
            {magicLoading ? copy.auth.signingIn : "Send Magic Sign-In Link"}
          </button>
          {isOwnerRecoveryEmail ? (
            <button
              className="btn-secondary"
              type="button"
              disabled={rescueLoading}
              onClick={handleOwnerRescue}
              style={{ width: "100%", justifyContent: "center" }}
            >
              {rescueLoading ? copy.auth.signingIn : "Owner Account Rescue"}
            </button>
          ) : null}
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
