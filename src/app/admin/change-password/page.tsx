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

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace("/admin/login");
      }
    };
    checkSession();
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
        <form onSubmit={handleUpdate} className="auth-form">
          <label className="form-field">
            {copy.auth.newPassword}
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          <label className="form-field">
            {copy.auth.confirmPassword}
            <input
              type="password"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              required
            />
          </label>
          {error ? <div className="auth-error">{error}</div> : null}
          <button className="button-primary" type="submit" disabled={loading}>
            {loading ? copy.auth.updating : copy.auth.updatePassword}
          </button>
        </form>
      </div>
    </div>
  );
}
