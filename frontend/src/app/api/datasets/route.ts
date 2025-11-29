import { NextResponse } from "next/server";
import { listDatasetSummaries } from "@/lib/logbook";

export async function GET() {
  const datasets = await listDatasetSummaries();
  return NextResponse.json({ datasets });
}
