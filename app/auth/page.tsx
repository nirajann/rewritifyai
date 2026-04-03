"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError("");

      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/signup";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          email,
          password,
        }),
      });

      const raw = await res.text();

      let data: any;
      try {
        data = JSON.parse(raw);
      } catch {
        throw new Error("Auth server is not set up correctly yet.");
      }

      if (!res.ok || !data.success) {
        throw new Error(
          data.message ||
            (mode === "login" ? "Login failed." : "Signup failed.")
        );
      }

      if (data.user) {
        localStorage.setItem("rewritify_user", JSON.stringify(data.user));
      }

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen max-w-md items-center px-4">
        <div className="w-full rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-950">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h1>

          <p className="mt-3 text-base text-slate-600">
            {mode === "login"
              ? "Login to access your workspace and saved documents."
              : "Sign up to save your documents, versions, and settings."}
          </p>

          <div className="mt-6 space-y-4">
            {mode === "signup" ? (
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Full name
                </label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-4 text-base text-slate-950 placeholder:text-slate-400 outline-none focus:border-emerald-500"
                />
              </div>
            ) : null}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-4 text-base text-slate-950 placeholder:text-slate-400 outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-4 text-base text-slate-950 placeholder:text-slate-400 outline-none focus:border-emerald-500"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full rounded-2xl bg-emerald-500 px-5 py-4 text-base font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-60"
            >
              {loading
                ? "Please wait..."
                : mode === "login"
                ? "Login"
                : "Sign Up"}
            </button>

            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <button
              onClick={() =>
                setMode((prev) => (prev === "login" ? "signup" : "login"))
              }
              className="w-full text-sm font-medium text-slate-600 hover:text-slate-950"
            >
              {mode === "login"
                ? "Need an account? Sign up"
                : "Already have an account? Login"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}