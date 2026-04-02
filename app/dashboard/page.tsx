export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(to_bottom,_#f8fafc,_#eef2f7)] px-4 py-8 md:px-8 md:py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <div className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
            Progress Dashboard
          </div>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
            Your writing progress
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-slate-600">
            Track streaks, XP, achievements, and your premium writing growth.
          </p>
        </div>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Daily Streak
            </p>
            <p className="mt-3 text-3xl font-bold text-slate-950">7 days</p>
            <p className="mt-2 text-sm text-slate-600">Consistency builds mastery.</p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              XP Earned
            </p>
            <p className="mt-3 text-3xl font-bold text-slate-950">1280</p>
            <p className="mt-2 text-sm text-slate-600">Each rewrite pushes you forward.</p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Level
            </p>
            <p className="mt-3 text-2xl font-bold text-slate-950">Clear Communicator</p>
            <p className="mt-2 text-sm text-slate-600">Your current premium rank.</p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Words Refined
            </p>
            <p className="mt-3 text-3xl font-bold text-slate-950">12480</p>
            <p className="mt-2 text-sm text-slate-600">Total words improved so far.</p>
          </div>
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-950">Today’s Challenge</h2>
              <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
                +50 XP
              </span>
            </div>

            <p className="text-slate-600">
              Complete 3 refinements today to maintain your streak and unlock bonus XP.
            </p>

            <div className="mt-5 h-3 w-full overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-2/3 rounded-full bg-slate-950" />
            </div>

            <p className="mt-3 text-sm font-medium text-slate-700">Progress: 2 / 3 complete</p>
          </div>

          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-950">Weekly Insights</h2>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Human Score Avg
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-950">89%</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Clarity Gain
                </p>
                <p className="mt-2 text-2xl font-bold text-emerald-600">+14%</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-950">Achievements</h2>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-950">First Refinement</p>
              <p className="mt-1 text-sm text-slate-600">Completed your first rewrite session.</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-950">7-Day Streak</p>
              <p className="mt-1 text-sm text-slate-600">Stayed consistent for a full week.</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-950">Clarity Champion</p>
              <p className="mt-1 text-sm text-slate-600">Boosted readability across documents.</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-950">Academic Mode Master</p>
              <p className="mt-1 text-sm text-slate-600">Used advanced writing modes effectively.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}