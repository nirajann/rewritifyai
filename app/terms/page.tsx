export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 md:px-8">
      <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-950">
          Terms of Service
        </h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          These beta terms describe the current product honestly and avoid
          promises that are not supported by the codebase yet.
        </p>

        <div className="mt-8 space-y-8 text-sm leading-7 text-slate-700">
          <section>
            <h2 className="text-lg font-semibold text-slate-950">Beta product</h2>
            <p className="mt-2">
              RewritifyAI is a beta writing tool. Features may change, be
              unavailable, or be removed while the product is still being tested.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-950">Output review</h2>
            <p className="mt-2">
              You are responsible for reviewing outputs before using them.
              Rewrites can still contain mistakes, preserve unintended wording,
              or require human judgment.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-950">Plans and limits</h2>
            <p className="mt-2">
              Plan labels may appear in the product, but billing and quota
              enforcement are not fully active in the current backend. Plan
              descriptions should be treated as beta information, not guaranteed
              service commitments.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-950">Acceptable use</h2>
            <p className="mt-2">
              Do not use the service for unlawful activity, abuse, spam, or to
              misrepresent the tool as providing certified legal, medical,
              academic, or compliance judgment.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
