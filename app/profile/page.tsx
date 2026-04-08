"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type StoredUser = {
  id: string;
  email: string;
};

type Profile = {
  id: string;
  email: string;
  full_name: string;
  plan: string;
  created_at?: string;
  updated_at?: string;
};

export default function ProfilePage() {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        setError("");
        setMessage("");

        const rawUser = localStorage.getItem("rewritify_user");

        if (!rawUser) {
          router.push("/auth");
          return;
        }

        const parsedUser = JSON.parse(rawUser) as StoredUser;
        setUser(parsedUser);

        const res = await fetch(`/api/auth/me?userId=${parsedUser.id}`);
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to load profile");
        }

        setProfile(data.profile);
        setFullName(data.profile.full_name || "");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [router]);

  const handleSave = async () => {
    try {
      if (!user) return;

      setSaving(true);
      setError("");
      setMessage("");

      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          fullName,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update profile");
      }

      setProfile(data.profile);
      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const plan = useMemo(() => {
    return (profile?.plan || "free").toLowerCase();
  }, [profile]);

  const planStyles =
    plan === "pro"
      ? "bg-violet-100 text-violet-700 border-violet-200"
      : plan === "plus"
      ? "bg-amber-100 text-amber-700 border-amber-200"
      : "bg-emerald-100 text-emerald-700 border-emerald-200";

  const prettyPlan = plan.charAt(0).toUpperCase() + plan.slice(1);

  const displayName =
    fullName?.trim() || profile?.email?.split("@")[0] || "User";

  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  const joinedDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString()
    : "Recently";

  const updatedDate = profile?.updated_at
    ? new Date(profile.updated_at).toLocaleString()
    : "Not available";

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            Profile Settings
          </h1>
          <p className="mt-2 text-slate-600">
            Manage your account details and review your current beta access.
          </p>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-sm text-slate-500">Loading profile...</p>
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 shadow-sm">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-1">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-900 text-2xl font-bold text-white shadow-sm">
                  {initials || "U"}
                </div>

                <h2 className="mt-4 text-2xl font-bold text-slate-950">
                  {displayName}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {profile?.email || user?.email}
                </p>

                <div
                  className={`mt-4 rounded-full border px-4 py-2 text-sm font-semibold ${planStyles}`}
                >
                  {prettyPlan} Plan
                </div>
              </div>

              <div className="mt-8 space-y-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Joined
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-950">
                    {joinedDate}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Last updated
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-950">
                    {updatedDate}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Account status
                  </p>
                  <p className="mt-1 text-sm font-semibold text-emerald-700">
                    Active
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-950">
                  Personal Information
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Update your visible profile details here.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Full name
                  </label>
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-4 text-base text-slate-950 placeholder:text-slate-400 outline-none transition focus:border-emerald-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Email address
                  </label>
                  <input
                    value={profile?.email || user?.email || ""}
                    disabled
                    className="w-full rounded-2xl border border-slate-300 bg-slate-100 px-4 py-4 text-base text-slate-600 outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Current plan
                  </label>
                  <div
                    className={`rounded-2xl border px-4 py-4 text-base font-semibold ${planStyles}`}
                  >
                    {prettyPlan}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Account type
                  </label>
                  <div className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-4 text-base font-semibold text-slate-800">
                    Personal
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-2xl bg-emerald-500 px-6 py-4 text-base font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>

                <button
                  onClick={() => {
                    setFullName(profile?.full_name || "");
                    setMessage("");
                    setError("");
                  }}
                  type="button"
                  className="rounded-2xl border border-slate-300 bg-white px-6 py-4 text-base font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Reset
                </button>
              </div>

              {message ? (
                <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-700">
                  {message}
                </div>
              ) : null}

              {error ? (
                <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-slate-950">
                      Plan Overview
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Daily rewrite limits are active for beta accounts, but
                      billing and higher-tier access are not fully active yet.
                    </p>
                  </div>

                  <div
                    className={`rounded-full border px-4 py-2 text-sm font-semibold ${planStyles}`}
                  >
                    {prettyPlan} Plan
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-sm font-semibold text-slate-950">
                      Current access
                    </p>
                    <ul className="mt-3 space-y-2 text-sm text-slate-600">
                      <li>Humanize, rewrite, and paraphrase</li>
                      <li>Saved documents and versions</li>
                      <li>Basic workspace tools</li>
                    </ul>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-sm font-semibold text-slate-950">
                      Planned additions
                    </p>
                    <ul className="mt-3 space-y-2 text-sm text-slate-600">
                      <li>AI Detector placeholder</li>
                      <li>Plagiarism Checker placeholder</li>
                      <li>Higher rewrite limits are not live yet</li>
                    </ul>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-sm font-semibold text-slate-950">
                      Beta status
                    </p>
                    <p className="mt-3 text-sm text-slate-600">
                      You are currently on the{" "}
                      <span className="font-semibold">{prettyPlan}</span> plan.
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                      Billing actions are not live yet. Use the pricing page for
                      current beta plan information.
                    </p>

                    <div className="mt-4 flex flex-wrap gap-3">
                      <a
                        href="/pricing"
                        className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                      >
                        View Pricing
                      </a>

                      <a
                        href="/support"
                        className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Contact Support
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
