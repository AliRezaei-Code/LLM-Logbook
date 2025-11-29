import { NextResponse } from "next/server";
import { getDatasetBySlug } from "@/lib/logbook";

type Params = {
  slug: string;
};

export async function GET(
  _request: Request,
  { params }: { params: Params },
) {
  try {
    const dataset = await getDatasetBySlug(params.slug);
    return NextResponse.json(dataset);
  } catch {
    return NextResponse.json(
      { error: "Dataset not found" },
      { status: 404 },
    );
  }
}
