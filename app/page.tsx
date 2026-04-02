import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto max-w-7xl px-4 py-14 md:px-8 md:py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <div className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              Premium AI Writing Platform
            </div>

            <h1 className="mt-6 max-w-3xl text-5xl font-bold tracking-tight text-slate-950 md:text-6xl leading-tight">
              Humanize your writing with clarity, confidence, and premium control.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              RewritifyAI helps you rewrite robotic text, improve clarity, and
              refine tone with a clean premium workspace built for students,
              professionals, and creators.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/workspace"
                className="rounded-2xl bg-emerald-500 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-emerald-600"
              >
                Start for free
              </Link>

              <Link
                href="/dashboard"
                className="rounded-2xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
              >
                View dashboard
              </Link>
            </div>

            <div className="mt-10 space-y-4 text-slate-700">
              <div className="flex items-start gap-3">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <p>Humanize AI-generated text so it sounds natural and real.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <p>Rewrite with academic, report, research, and proposal modes.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <p>Track progress with scores, streaks, achievements, and insights.</p>
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-200 bg-slate-50 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
            <div className="rounded-[28px] border border-slate-200 bg-white overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <div>
                  <p className="text-sm font-semibold text-slate-950">Editor Workspace</p>
                  <p className="text-xs text-slate-500">Humanize • Improve • Paraphrase</p>
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                  91% Human Score
                </span>
              </div>

              <div className="grid gap-0 lg:grid-cols-[220px_1fr]">
                <aside className="border-r border-slate-200 bg-slate-50 p-4">
                  <div className="space-y-2">
                    <div className="rounded-xl bg-emerald-100 px-4 py-3 text-sm font-semibold text-emerald-700">
                      Humanize
                    </div>
                    <div className="rounded-xl px-4 py-3 text-sm font-medium text-slate-600">
                      Paraphrase
                    </div>
                    <div className="rounded-xl px-4 py-3 text-sm font-medium text-slate-600">
                      Improve
                    </div>
                    <div className="rounded-xl px-4 py-3 text-sm font-medium text-slate-600">
                      AI Writer
                    </div>
                  </div>

                  <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Today
                    </p>
                    <p className="mt-2 text-2xl font-bold text-slate-950">645</p>
                    <p className="text-sm text-slate-500">words refined</p>
                  </div>
                </aside>

                <div className="p-5">
                  <div className="grid gap-4">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Input
                      </p>
                      <p className="mt-3 text-sm leading-7 text-slate-700">
                        The rapid advancement of artificial intelligence has
                        significantly changed writing workflows, although the
                        output may still sound repetitive and slightly robotic.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                        Humanized Output
                      </p>
                      <p className="mt-3 text-sm leading-7 text-slate-900">
                        Artificial intelligence has changed how people write,
                        but the output can still feel repetitive and less natural
                        than human writing.
                      </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Readability
                        </p>
                        <p className="mt-2 text-2xl font-bold text-slate-950">High</p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Tone
                        </p>
                        <p className="mt-2 text-2xl font-bold text-slate-950">Natural</p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Gain
                        </p>
                        <p className="mt-2 text-2xl font-bold text-emerald-600">+18%</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button className="rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-600">
                        Humanize
                      </button>
                      <button className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                        Export
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-14 md:grid-cols-3 md:px-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Humanize
            </p>
            <h3 className="mt-3 text-xl font-bold text-slate-950">
              Make AI writing sound more real
            </h3>
            <p className="mt-3 text-slate-600 leading-7">
              Remove robotic phrasing and produce cleaner, more natural writing.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Premium Control
            </p>
            <h3 className="mt-3 text-xl font-bold text-slate-950">
              Rewrite by mode and purpose
            </h3>
            <p className="mt-3 text-slate-600 leading-7">
              Switch between school, report, thesis, research, and proposal workflows.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Gamified Progress
            </p>
            <h3 className="mt-3 text-xl font-bold text-slate-950">
              Track XP, streaks, and growth
            </h3>
            <p className="mt-3 text-slate-600 leading-7">
              Turn daily writing improvement into a premium progress experience.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}