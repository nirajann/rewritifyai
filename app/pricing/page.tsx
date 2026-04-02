export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(to_bottom,_#f8fafc,_#eef2f7)] px-4 py-8 md:px-8 md:py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <div className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
            Pricing
          </div>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
            Choose your premium writing plan
          </h1>
          <p className="mt-3 text-lg text-slate-600">
            Start simple, then upgrade for deeper rewriting power and premium workspace features.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">Starter</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-950">$0</h2>
            <p className="mt-2 text-slate-600">For trying the workspace.</p>

            <ul className="mt-6 space-y-3 text-sm text-slate-700">
              <li>• Basic rewriting tools</li>
              <li>• Limited daily usage</li>
              <li>• Basic notes and scores</li>
            </ul>

            <button className="mt-8 w-full rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50">
              Get Started
            </button>
          </div>

          <div className="rounded-[32px] border border-slate-950 bg-slate-950 p-6 text-white shadow-xl">
            <p className="text-sm font-semibold text-slate-300">Pro</p>
            <h2 className="mt-3 text-3xl font-bold">$19</h2>
            <p className="mt-2 text-slate-300">For serious students and professionals.</p>

            <ul className="mt-6 space-y-3 text-sm text-slate-200">
              <li>• Humanize, paraphrase, improve</li>
              <li>• Premium modes and tone control</li>
              <li>• Dashboard and achievements</li>
              <li>• More daily usage</li>
            </ul>

            <button className="mt-8 w-full rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 hover:opacity-90">
              Choose Pro
            </button>
          </div>

          <div className="rounded-[32px] border border-amber-200 bg-amber-50 p-6 shadow-sm">
            <p className="text-sm font-semibold text-amber-700">Signature</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-950">$39</h2>
            <p className="mt-2 text-slate-700">For premium writing workflows and teams.</p>

            <ul className="mt-6 space-y-3 text-sm text-slate-700">
              <li>• Everything in Pro</li>
              <li>• File upload and export</li>
              <li>• Deeper scoring insights</li>
              <li>• Priority processing</li>
            </ul>

            <button className="mt-8 w-full rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:opacity-90">
              Choose Signature
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}