import { NextResponse } from "next/server";

import { getDashboardStats } from "@/lib/db";
import { todayKey } from "@/lib/date";

export const runtime = "nodejs";

export async function GET() {
  const stats = getDashboardStats(todayKey());
  return NextResponse.json(stats);
}
