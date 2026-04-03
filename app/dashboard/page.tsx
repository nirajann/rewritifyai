"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type DocumentItem = {
  id: string;
  title: string;
  input_text: string;
  output_text: string;
  tool: string;
  tone: string;
  mode: string;
  word_count: number;
  human_score: number;
  created_at: string;
  updated_at: string;
};

type StoredUser = {
  id: string;
  email: string;
};

export default function DashboardPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState<StoredUser | null>(null);
  const router = useRouter();

  async function loadDocuments(userId: string) {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`/api/documents?userId=${userId}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to load documents");
      }

      setDocuments(data.documents || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load documents");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const rawUser = localStorage.getItem("rewritify_user");

    if (!rawUser) {
      router.push("/auth");
      return;
    }

    try {
      const parsedUser = JSON.parse(rawUser);
      setUser(parsedUser);
      loadDocuments(parsedUser.id);
    } catch {
      localStorage.removeItem("rewritify_user");
      router.push("/auth");
    }
  }, [router]);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-950">Dashboard</h1>
          <p className="mt-2 text-slate-600">
            View and reopen your saved documents.
          </p>
          {user && (
            <p className="mt-3 text-sm text-slate-400">{user.email}</p>
          )}
        </div>

        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Loading documents...</p>
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 shadow-sm">
            {error}
          </div>
        ) : documents.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-600">No saved documents yet.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {documents.map((doc) => (
              <Link
                key={doc.id}
                href={`/workspace?id=${doc.id}`}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-slate-950">
                      {doc.title || "Untitled Document"}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Tool: {doc.tool} · Tone: {doc.tone} · Mode: {doc.mode}
                    </p>

                    <p className="mt-3 line-clamp-2 text-sm text-slate-600">
                      {doc.output_text || doc.input_text || "No preview available."}
                    </p>

                    <p className="mt-3 text-xs text-slate-400">
                      Updated: {new Date(doc.updated_at).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3 text-sm">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                      {doc.word_count} words
                    </span>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">
                      {doc.human_score}% human
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}