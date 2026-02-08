"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useLanguage } from "@/components/language-context";
import { getCopy } from "@/lib/i18n";

export default function LoginPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const copy = getCopy(language);
  const [email, setEmail] = useState("neatcurb@gmail.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
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
              required
            />
          </label>
          <label className="form-field">
            {copy.auth.password}
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          {error ? <div className="auth-error">{error}</div> : null}
          <button className="button-primary" type="submit" disabled={loading}>
            {loading ? copy.auth.signingIn : copy.auth.signInButton}
          </button>
          <a className="auth-home" href="/">
            {copy.auth.backHome}
          </a>
        </form>
      </div>
    </div>
  );
}
