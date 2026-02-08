"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
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
        .from("user_profiles")
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
      <div className="panel auth-card">
        <img
          src="/brand/neat-curb-logo-full.svg"
          alt="Neat Curb LLC logo"
          className="auth-logo"
        />
        <div className="section-title">Admin Login</div>
        <div className="section-sub">
          Secure access for Neat Curb leadership.
        </div>

        <form onSubmit={handleLogin} className="auth-form">
          <label className="form-field">
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label className="form-field">
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          {error ? <div className="auth-error">{error}</div> : null}
          <button className="button-primary" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
