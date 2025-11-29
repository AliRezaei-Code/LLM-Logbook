import { promises as fs } from "fs";
import path from "path";

type RawConversation = {
  instruction: string;
  output: string;
};

type RawDataset = {
  model_name?: string;
  prompt_file?: string;
  temperature?: number;
  top_p?: number;
  presence_penalty?: number;
  frequency_penalty?: number;
  prompt_format?: string;
  conversations?: RawConversation[];
};

export type Conversation = RawConversation;

export type Dataset = {
  label: string;
  slug: string;
  filename: string;
  modelName: string;
  promptFile?: string;
  promptFormat: string;
  temperature: number | null;
  topP: number | null;
  presencePenalty: number | null;
  frequencyPenalty: number | null;
  totalPrompts: number;
  conversations: Conversation[];
};

export type DatasetSummary = Omit<Dataset, "conversations">;

// Raw data lives beside the Next.js app (../Raw_Data).
const dataDir = path.join(process.cwd(), "..", "Raw_Data");

const datasetMappings = [
  {
    label: "Nous-Capybara-7B ShareGPT",
    filename: "NousResearch-Nous-Capybara-7B_September_25_2023.json",
  },
  {
    label: "Nous-Hermes-llama-2-7b Alpaca",
    filename: "NousResearch-Nous-Hermes-llama-2-7b_September_25_2023.json",
  },
  {
    label: "Redmond-Puffin-13B ShareGPT",
    filename: "NousResearch-Redmond-Puffin-13B_September_25_2023.json",
  },
  {
    label: "teknium-OpenHermes-13B Alpaca",
    filename: "teknium-OpenHermes-13B_September_25_2023.json",
  },
  {
    label: "teknium-OpenHermes-7B Alpaca",
    filename: "teknium-OpenHermes-7B_September_25_2023.json",
  },
  {
    label: "PygmalionAI-mythalion-13b Alpaca",
    filename: "PygmalionAI-mythalion-13b_September_25_2023.json",
  },
  {
    label: "Nous-Hermes-llama-2-13B Alpaca",
    filename: "NousResearch-Nous-Hermes-Llama2-13b_September_25_2023.json",
  },
] as const;

const withSlugs = datasetMappings.map((entry) => ({
  ...entry,
  slug: entry.label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, ""),
}));

async function readDatasetFile(filename: string): Promise<RawDataset> {
  const filePath = path.join(dataDir, filename);
  const contents = await fs.readFile(filePath, "utf-8");
  return JSON.parse(contents) as RawDataset;
}

export function getDatasetChoices() {
  return withSlugs.map(({ label, slug, filename }) => ({ label, slug, filename }));
}

export async function getDatasetBySlug(slug: string): Promise<Dataset> {
  const entry = withSlugs.find((dataset) => dataset.slug === slug);

  if (!entry) {
    throw new Error(`Dataset not found for slug: ${slug}`);
  }

  const raw = await readDatasetFile(entry.filename);
  const conversations = raw.conversations ?? [];

  return {
    label: entry.label,
    slug: entry.slug,
    filename: entry.filename,
    modelName: raw.model_name ?? entry.label,
    promptFile: raw.prompt_file,
    promptFormat: raw.prompt_format ?? "unknown",
    temperature: typeof raw.temperature === "number" ? raw.temperature : null,
    topP: typeof raw.top_p === "number" ? raw.top_p : null,
    presencePenalty:
      typeof raw.presence_penalty === "number" ? raw.presence_penalty : null,
    frequencyPenalty:
      typeof raw.frequency_penalty === "number" ? raw.frequency_penalty : null,
    totalPrompts: conversations.length,
    conversations,
  };
}

export async function listDatasetSummaries(): Promise<DatasetSummary[]> {
  const datasets = await Promise.all(
    withSlugs.map((item) => getDatasetBySlug(item.slug)),
  );

  return datasets.map(({ conversations, ...summary }) => {
    void conversations;
    return summary;
  });
}
