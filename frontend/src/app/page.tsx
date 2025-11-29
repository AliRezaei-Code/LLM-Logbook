import Link from "next/link";
import { getDatasetBySlug, listDatasetSummaries } from "@/lib/logbook";

const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-US").format(value);

export default async function Home() {
  const summaries = await listDatasetSummaries();
  const totalPrompts = summaries.reduce(
    (acc, dataset) => acc + dataset.totalPrompts,
    0,
  );
  const promptFormats = new Set(
    summaries.map((dataset) => dataset.promptFormat),
  ).size;
  const temps = summaries
    .map((dataset) => dataset.temperature)
    .filter((value): value is number => typeof value === "number");

  const tempRange = temps.length
    ? `${Math.min(...temps).toFixed(1)}–${Math.max(...temps).toFixed(1)}`
    : "n/a";

  const featured = summaries[0]
    ? await getDatasetBySlug(summaries[0].slug)
    : null;

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-70" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(14,165,233,0.16),transparent_32%),radial-gradient(circle_at_85%_20%,rgba(251,191,36,0.16),transparent_26%),radial-gradient(circle_at_50%_80%,rgba(14,165,233,0.08),transparent_30%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.04),transparent_35%,rgba(255,255,255,0.03))]" />
      </div>

      <main className="relative mx-auto flex max-w-6xl flex-col gap-12 px-6 py-14 sm:px-10">
        <header className="space-y-4">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            LLM Logbook / Next.js UI
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl font-semibold leading-tight text-slate-50 sm:text-5xl">
              Benchmark runs, captured in one focused UI.
            </h1>
            <p className="max-w-2xl text-lg text-slate-300">
              Explore the benchmark conversations stored in{" "}
              <code className="rounded-md bg-white/10 px-1.5 py-0.5 text-sm text-slate-100">
                Raw_Data
              </code>
              , compare model settings, and drill into responses without
              starting the Gradio app.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href={summaries[0] ? `/datasets/${summaries[0].slug}` : "#"}
              className="inline-flex items-center gap-2 rounded-full bg-sky-500 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-sky-500/25 transition hover:translate-y-[-1px] hover:bg-sky-400"
            >
              Open featured run →
            </Link>
            <a
              href="https://nextjs.org/docs"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-white/30 hover:bg-white/10"
            >
              Developer docs
            </a>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Datasets", value: summaries.length },
            { label: "Prompts tracked", value: formatNumber(totalPrompts) },
            { label: "Prompt formats", value: promptFormats || "n/a" },
            { label: "Temperature span", value: tempRange },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-5 shadow-lg shadow-black/30"
            >
              <p className="text-sm uppercase tracking-wide text-slate-400">
                {stat.label}
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-50">
                {stat.value}
              </p>
            </div>
          ))}
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-wide text-slate-400">
                Model runs
              </p>
              <h2 className="text-2xl font-semibold text-slate-50">
                Browse every dataset
              </h2>
            </div>
            <Link
              href="/api/datasets"
              className="text-sm font-medium text-amber-200 underline decoration-amber-300 decoration-dashed underline-offset-4 hover:text-amber-100"
            >
              Export JSON
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {summaries.map((dataset) => (
              <Link
                key={dataset.slug}
                href={`/datasets/${dataset.slug}`}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-black/25 transition hover:border-amber-200/50 hover:bg-white/10"
              >
                <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-sky-400/10 blur-3xl transition duration-500 group-hover:scale-125" />
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5">
                    <p className="text-sm uppercase tracking-wide text-slate-400">
                      {dataset.promptFormat}
                    </p>
                    <h3 className="text-xl font-semibold text-slate-50">
                      {dataset.label}
                    </h3>
                    <p className="text-sm text-slate-300">
                      {dataset.modelName}
                    </p>
                  </div>
                  <span className="rounded-full bg-amber-300/20 px-3 py-1 text-xs font-semibold text-amber-100 ring-1 ring-amber-200/50">
                    {dataset.totalPrompts} prompts
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-300">
                  {typeof dataset.temperature === "number" && (
                    <span className="rounded-full bg-black/30 px-3 py-1">
                      temp {dataset.temperature}
                    </span>
                  )}
                  {typeof dataset.topP === "number" && (
                    <span className="rounded-full bg-black/30 px-3 py-1">
                      top-p {dataset.topP}
                    </span>
                  )}
                  {typeof dataset.presencePenalty === "number" && (
                    <span className="rounded-full bg-black/30 px-3 py-1">
                      presence {dataset.presencePenalty}
                    </span>
                  )}
                  {typeof dataset.frequencyPenalty === "number" && (
                    <span className="rounded-full bg-black/30 px-3 py-1">
                      frequency {dataset.frequencyPenalty}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {featured && (
          <section className="space-y-4 rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-slate-900/60 p-6 shadow-2xl shadow-black/40">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <p className="text-sm uppercase tracking-wide text-slate-300">
                  Featured run
                </p>
                <h3 className="text-2xl font-semibold text-slate-50">
                  {featured.label}
                </h3>
                <p className="text-sm text-slate-300">
                  {featured.modelName} · {featured.promptFormat} ·{" "}
                  {featured.totalPrompts} prompts
                </p>
              </div>
              <Link
                href={`/datasets/${featured.slug}`}
                className="inline-flex w-fit items-center gap-2 rounded-full bg-white text-slate-950 px-4 py-2 text-sm font-semibold transition hover:translate-y-[-1px] hover:bg-amber-200"
              >
                Dive deeper →
              </Link>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <p className="text-sm uppercase tracking-wide text-slate-300">
                  Run parameters
                </p>
                <dl className="mt-3 grid grid-cols-2 gap-3 text-sm text-slate-200">
                  <div>
                    <dt className="text-slate-400">Prompt format</dt>
                    <dd className="font-semibold">{featured.promptFormat}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-400">Prompt file</dt>
                    <dd className="font-semibold">
                      {featured.promptFile || "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-400">Temperature</dt>
                    <dd className="font-semibold">
                      {featured.temperature ?? "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-400">Top P</dt>
                    <dd className="font-semibold">{featured.topP ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-400">Presence penalty</dt>
                    <dd className="font-semibold">
                      {featured.presencePenalty ?? "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-400">Frequency penalty</dt>
                    <dd className="font-semibold">
                      {featured.frequencyPenalty ?? "—"}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="space-y-3 rounded-2xl border border-white/10 bg-black/30 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm uppercase tracking-wide text-slate-300">
                    Conversation preview
                  </p>
                  <span className="text-xs text-slate-400">
                    first 3 prompts
                  </span>
                </div>
                {featured.conversations.slice(0, 3).map((conversation, index) => (
                  <div
                    key={conversation.instruction.slice(0, 20) + index}
                    className="rounded-xl border border-white/10 bg-white/5 p-3"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Instruction {index + 1}
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-slate-100">
                      {conversation.instruction}
                    </p>
                    <div className="mt-3 rounded-lg bg-black/40 p-3 text-sm text-slate-200">
                      {conversation.output}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
