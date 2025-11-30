import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getDatasetBySlug,
  getDatasetChoices,
  type Conversation,
} from "@/lib/logbook";

type Params = {
  slug: string;
};

type SearchParams = {
  q?: string;
  scope?: string;
};

export async function generateStaticParams() {
  return getDatasetChoices().map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const dataset = await getDatasetBySlug(slug).catch(() => null);

  if (!dataset) {
    return { title: "Dataset not found | LLM Logbook" };
  }

  return {
    title: `${dataset.label} | LLM Logbook`,
    description: `Inspect ${dataset.label} conversations and parameters.`,
  };
}

function ConversationEntry({
  index,
  conversation,
}: {
  index: number;
  conversation: Conversation;
}) {
  return (
    <details className="group rounded-2xl border border-white/10 bg-white/5 p-4 open:border-amber-200/40 open:bg-white/10">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Instruction {index + 1}
          </p>
          <p className="line-clamp-2 text-sm text-slate-100">
            {conversation.instruction}
          </p>
        </div>
        <span className="rounded-full bg-sky-400/15 px-3 py-1 text-xs font-semibold text-sky-100 group-open:bg-amber-300/30 group-open:text-amber-100">
          View
        </span>
      </summary>
      <div className="mt-3 space-y-2 text-sm text-slate-100">
        <p className="whitespace-pre-wrap rounded-lg bg-black/40 p-3 leading-relaxed">
          {conversation.instruction}
        </p>
        <div className="rounded-lg border border-white/10 bg-slate-900/60 p-3 text-slate-50">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Response
          </p>
          <p className="mt-2 whitespace-pre-wrap leading-relaxed">
            {conversation.output}
          </p>
        </div>
      </div>
    </details>
  );
}

export default async function DatasetPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const readParam = (key: keyof SearchParams) => {
    if (!resolvedSearchParams) return undefined;
    if (typeof (resolvedSearchParams as URLSearchParams).get === "function") {
      return (resolvedSearchParams as URLSearchParams).get(key) ?? undefined;
    }

    const value = (resolvedSearchParams as Record<string, string | string[] | undefined>)[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const q = readParam("q") ?? "";
  const scope = readParam("scope") ?? "instruction";
  const dataset = await getDatasetBySlug(slug).catch(() => null);

  if (!dataset) {
    notFound();
  }

  const normalizedQuery = q.trim().toLowerCase();
  const filteredConversations = normalizedQuery
    ? dataset.conversations.filter(({ instruction, output }) => {
        const inInstruction = instruction
          .toLowerCase()
          .includes(normalizedQuery);
        const inResponse = output.toLowerCase().includes(normalizedQuery);

        if (scope === "response") return inResponse;
        if (scope === "both") return inInstruction || inResponse;
        return inInstruction;
      })
    : dataset.conversations;

  const parameterBadges = [
    { label: "Prompt format", value: dataset.promptFormat },
    { label: "Temperature", value: dataset.temperature ?? "—" },
    { label: "Top P", value: dataset.topP ?? "—" },
    { label: "Presence", value: dataset.presencePenalty ?? "—" },
    { label: "Frequency", value: dataset.frequencyPenalty ?? "—" },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_20%,rgba(14,165,233,0.12),transparent_28%),radial-gradient(circle_at_90%_10%,rgba(251,191,36,0.12),transparent_25%)]"
        aria-hidden
      />
      <main className="relative mx-auto flex max-w-5xl flex-col gap-8 px-6 py-14 sm:px-10">
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <Link
            href="/"
            className="rounded-full border border-white/15 bg-white/5 px-3 py-1 transition hover:border-white/30 hover:bg-white/10"
          >
            ← Back to overview
          </Link>
          <span className="text-slate-500">/</span>
          <span className="font-semibold text-slate-100">{dataset.label}</span>
        </div>

        <header className="space-y-3">
          <p className="text-sm uppercase tracking-wide text-slate-400">
            Dataset
          </p>
          <h1 className="text-3xl font-semibold text-slate-50 sm:text-4xl">
            {dataset.label}
          </h1>
          <p className="text-slate-300">
            {dataset.modelName} · {dataset.promptFormat} · {dataset.totalPrompts}{" "}
            prompts
          </p>
          <div className="flex flex-wrap gap-2 text-xs text-slate-200">
            {parameterBadges.map((badge) => (
              <span
                key={badge.label}
                className="rounded-full bg-black/30 px-3 py-1 ring-1 ring-white/10"
              >
                {badge.label}: {badge.value}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/api/datasets/${dataset.slug}`}
              className="inline-flex items-center gap-2 rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:translate-y-[-1px] hover:bg-sky-400"
            >
              Download JSON
            </Link>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100">
              Raw file: {dataset.filename}
            </span>
          </div>
        </header>

        <section className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/30 sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Prompt file
            </p>
            <p className="mt-1 text-lg font-semibold text-slate-50">
              {dataset.promptFile || "Not specified"}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Conversations
            </p>
            <p className="mt-1 text-lg font-semibold text-slate-50">
              {dataset.totalPrompts} captured prompts
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-wide text-slate-400">
                Conversations
              </p>
              <h2 className="text-2xl font-semibold text-slate-50">
                Each instruction and response
              </h2>
            </div>
            <span className="text-sm text-slate-300">
              Filter by substring and expand to inspect responses
            </span>
          </div>

          <form className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-black/25 sm:grid-cols-[2fr,1fr,auto]">
            <label className="flex flex-col gap-1 text-sm text-slate-200">
              <span className="text-xs uppercase tracking-wide text-slate-400">
                Search
              </span>
              <input
                type="text"
                name="q"
                defaultValue={q}
                placeholder="Find text in prompts or responses"
                className="rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-sm text-slate-50 outline-none transition focus:border-amber-200/60 focus:bg-black/40"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm text-slate-200">
              <span className="text-xs uppercase tracking-wide text-slate-400">
                Search scope
              </span>
              <select
                name="scope"
                defaultValue={scope}
                className="rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-sm text-slate-50 outline-none transition focus:border-amber-200/60 focus:bg-black/40"
              >
                <option value="instruction">Instructions only</option>
                <option value="response">Responses only</option>
                <option value="both">Both</option>
              </select>
            </label>

            <div className="flex items-end gap-2">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:translate-y-[-1px] hover:bg-sky-400"
              >
                Apply filters
              </button>
              <Link
                href={`/datasets/${dataset.slug}`}
                className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:border-white/30 hover:bg-white/10"
              >
                Clear
              </Link>
            </div>
          </form>

          <div className="text-sm text-slate-300">
            Showing{" "}
            <span className="font-semibold text-slate-100">
              {filteredConversations.length}
            </span>{" "}
            of {dataset.totalPrompts} conversations.
          </div>

          <div className="space-y-3">
            {filteredConversations.length === 0 && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
                No conversations match that filter.
              </div>
            )}

            {filteredConversations.map((conversation, index) => (
              <ConversationEntry
                key={`${dataset.slug}-${index}`}
                conversation={conversation}
                index={index}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
