export default function SupportPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 md:px-8">
      <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-950">
          Support
        </h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          Use this page as the main support contact point during beta.
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <h2 className="text-lg font-semibold text-slate-950">Contact</h2>
            <p className="mt-2 text-sm leading-7 text-slate-700">
              Email{" "}
              <a
                href="mailto:support@rewritifyai.com"
                className="font-semibold text-emerald-700 hover:text-emerald-800"
              >
                support@rewritifyai.com
              </a>
              . Replace this address before public beta if your real support
              inbox is different.
            </p>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <h2 className="text-lg font-semibold text-slate-950">What to include</h2>
            <p className="mt-2 text-sm leading-7 text-slate-700">
              Share what page you were using, what you expected, what happened
              instead, and whether the issue affected saved documents or output quality.
            </p>
          </section>
        </div>

        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-900">
          Beta note: AI Detector and Plagiarism Checker are not live product
          features yet. If you see them in the workspace, they are placeholders.
        </div>
      </div>
    </main>
  );
}
