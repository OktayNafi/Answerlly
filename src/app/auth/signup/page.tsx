"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [orgName, setOrgName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (!authData.user) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
      return;
    }

    const slug = orgName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Use the SECURITY DEFINER function to bypass RLS
    const { error: rpcError } = await supabase.rpc("create_org_for_user", {
      p_user_id: authData.user.id,
      p_org_name: orgName,
      p_org_slug: slug,
      p_full_name: fullName,
      p_email: email,
    });

    if (rpcError) {
      setError("Failed to create organization: " + rpcError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 justify-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-text)] flex items-center justify-center text-white font-bold text-lg">
            A
          </div>
          <span className="font-semibold text-xl tracking-tight">Answerly</span>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6">
          <h1 className="text-lg font-semibold mb-1">Create your account</h1>
          <p className="text-sm text-[var(--text-secondary)] mb-6">Get started with Answerly in minutes</p>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-xs text-[var(--text-secondary)] font-medium mb-1.5">Full Name</label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg-tertiary)] text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)] transition-all" placeholder="Your full name" required />
            </div>
            <div>
              <label className="block text-xs text-[var(--text-secondary)] font-medium mb-1.5">Business Name</label>
              <input type="text" value={orgName} onChange={(e) => setOrgName(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg-tertiary)] text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)] transition-all" placeholder="Your business name" required />
            </div>
            <div>
              <label className="block text-xs text-[var(--text-secondary)] font-medium mb-1.5">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg-tertiary)] text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)] transition-all" placeholder="you@company.com" required />
            </div>
            <div>
              <label className="block text-xs text-[var(--text-secondary)] font-medium mb-1.5">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg-tertiary)] text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)] transition-all" placeholder="••••••••" minLength={6} required />
            </div>

            {error && (
              <div className="text-xs text-[var(--red)] bg-[var(--red-soft)] px-3 py-2 rounded-lg">{error}</div>
            )}

            <button type="submit" disabled={loading} className="w-full py-2.5 rounded-lg bg-[var(--accent)] text-white text-sm font-semibold hover:bg-[#7c6bd6] transition-colors disabled:opacity-50">
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="text-xs text-[var(--text-tertiary)] text-center mt-5">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-[var(--accent-text)] hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
