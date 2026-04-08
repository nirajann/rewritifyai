export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 md:px-8">
      <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-950">
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          This beta policy explains how RewritifyAI currently handles account
          data and writing content based on the code that is live today.
        </p>

        <div className="mt-8 space-y-8 text-sm leading-7 text-slate-700">
          <section>
            <h2 className="text-lg font-semibold text-slate-950">What the app stores</h2>
            <p className="mt-2">
              The app stores account details, saved documents, document versions,
              and usage logs when those features are used. Saved document content
              can include both the text you submit and the output returned by the app.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-950">How text is processed</h2>
            <p className="mt-2">
              Text may be processed by the app&apos;s local rewrite pipeline and,
              for some tools, by external AI APIs when configured. Humanize
              currently runs through the app&apos;s local rewrite pipeline first.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-950">What we do not promise</h2>
            <p className="mt-2">
              We do not promise perfect accuracy, guaranteed originality,
              guaranteed undetectability, zero retention, or legal-grade
              confidentiality. Please review outputs before using them.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-950">Sensitive information</h2>
            <p className="mt-2">
              Please avoid submitting highly sensitive personal data, secrets, or
              regulated content unless you are comfortable with that material
              being processed by the app and its configured services.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
