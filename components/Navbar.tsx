"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type StoredUser = {
  id: string;
  email: string;
};

type Profile = {
  id: string;
  email: string;
  full_name: string;
  plan: string;
};

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/workspace", label: "Workspace" },
  { href: "/profile", label: "Profile" },
];

export default function Navbar() {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [desktopMenuOpen, setDesktopMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
  const desktopMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const rawUser = localStorage.getItem("rewritify_user");

    if (!rawUser) {
      setUser(null);
      setProfile(null);
      return;
    }

    try {
      const parsedUser = JSON.parse(rawUser) as StoredUser;
      setUser(parsedUser);

      async function loadProfile() {
        try {
          const res = await fetch(`/api/auth/me?userId=${parsedUser.id}`);
          const data = await res.json();

          if (res.ok && data.success) {
            setProfile(data.profile);
          }
        } catch {
          // ignore
        }
      }

      loadProfile();
    } catch {
      setUser(null);
      setProfile(null);
    }
  }, [pathname]);

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (!desktopMenuRef.current) return;
      if (!desktopMenuRef.current.contains(e.target as Node)) {
        setDesktopMenuOpen(false);
      }
    }

    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setDesktopMenuOpen(false);
        setMobileMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    setDesktopMenuOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("rewritify_user");
    setDesktopMenuOpen(false);
    setMobileMenuOpen(false);
    router.push("/auth");
  };

  const displayName = useMemo(() => {
    if (profile?.full_name?.trim()) return profile.full_name.trim();
    if (user?.email) return user.email.split("@")[0];
    return "Guest";
  }, [profile, user]);

  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  const plan = (profile?.plan || "free").toLowerCase();

  const planStyles =
    plan === "pro"
      ? "bg-violet-100 text-violet-700 border-violet-200"
      : plan === "plus"
      ? "bg-amber-100 text-amber-700 border-amber-200"
      : "bg-emerald-100 text-emerald-700 border-emerald-200";

  const prettyPlan = plan.charAt(0).toUpperCase() + plan.slice(1);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-3 py-3 sm:px-4 md:px-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 md:hidden"
              aria-label="Toggle menu"
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M3 5a.75.75 0 01.75-.75h12.5a.75.75 0 010 1.5H3.75A.75.75 0 013 5zm0 5a.75.75 0 01.75-.75h12.5a.75.75 0 010 1.5H3.75A.75.75 0 013 10zm0 5a.75.75 0 01.75-.75h12.5a.75.75 0 010 1.5H3.75A.75.75 0 013 15z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            <Link href="/" className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-lg font-bold text-white shadow-sm">
                R
              </div>

              <div className="min-w-0">
                <div className="truncate text-xl font-extrabold tracking-tight text-slate-950 sm:text-2xl">
                  RewritifyAI
                </div>
                <div className="hidden text-xs font-medium text-slate-400 sm:block">
                  Premium writing workspace
                </div>
              </div>
            </Link>
          </div>

          <nav className="hidden items-center gap-2 md:flex">
            {navItems
              .filter((item) => item.href !== "/profile")
              .map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                    isActive(item.href)
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {!user ? (
              <Link
                href="/auth"
                className="rounded-2xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600"
              >
                Login
              </Link>
            ) : (
              <div className="relative" ref={desktopMenuRef}>
                <button
                  onClick={() => setDesktopMenuOpen((prev) => !prev)}
                  className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-2 py-2 shadow-sm transition hover:bg-slate-50 sm:gap-3 sm:px-3"
                >
                  <span
                    className={`hidden rounded-full border px-2.5 py-1 text-[11px] font-bold sm:inline-flex ${planStyles}`}
                  >
                    {prettyPlan}
                  </span>

                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                    {initials || "U"}
                  </div>

                  <div className="hidden text-left lg:block">
                    <p className="max-w-[140px] truncate text-sm font-bold text-slate-950">
                      {displayName}
                    </p>
                    <p className="max-w-[160px] truncate text-xs text-slate-500">
                      {user.email}
                    </p>
                  </div>

                  <svg
                    className={`hidden h-4 w-4 text-slate-500 sm:block ${
                      desktopMenuOpen ? "rotate-180" : ""
                    } transition`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {desktopMenuOpen ? (
                  <div className="absolute right-0 mt-3 hidden w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl md:block">
                    <div className="border-b border-slate-100 px-4 py-4">
                      <p className="truncate text-sm font-bold text-slate-950">
                        {displayName}
                      </p>
                      <p className="mt-1 truncate text-xs text-slate-500">
                        {user.email}
                      </p>
                      <div className="mt-3">
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-bold ${planStyles}`}
                        >
                          {prettyPlan} Plan
                        </span>
                      </div>
                    </div>

                    <div className="p-2">
                      <Link
                        href="/profile"
                        className="flex w-full items-center rounded-xl px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
                      >
                        Profile
                      </Link>

                      <Link
                        href="/profile"
                        className="flex w-full items-center rounded-xl px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
                      >
                        Billing
                      </Link>

                      <Link
                        href="/profile"
                        className="flex w-full items-center rounded-xl px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
                      >
                        Settings
                      </Link>
                    </div>

                    <div className="border-t border-slate-100 p-2">
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center rounded-xl px-3 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>

        {mobileMenuOpen ? (
          <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm md:hidden">
            {user ? (
              <div className="mb-3 rounded-2xl border border-slate-100 bg-slate-50 p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                    {initials || "U"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-950">
                      {displayName}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {user.email}
                    </p>
                  </div>
                </div>

                <div className="mt-3">
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-bold ${planStyles}`}
                  >
                    {prettyPlan} Plan
                  </span>
                </div>
              </div>
            ) : null}

            <div className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    isActive(item.href)
                      ? "bg-slate-900 text-white"
                      : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {user ? (
              <div className="mt-3 border-t border-slate-100 pt-3">
                <Link
                  href="/profile"
                  className="mb-2 block rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Billing
                </Link>

                <Link
                  href="/profile"
                  className="mb-2 block rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Settings
                </Link>

                <button
                  onClick={handleLogout}
                  className="block w-full rounded-xl px-4 py-3 text-left text-sm font-semibold text-rose-600 hover:bg-rose-50"
                >
                  Logout
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </header>
  );
}