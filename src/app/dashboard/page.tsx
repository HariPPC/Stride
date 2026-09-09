import { connection } from "next/server";

import { DashboardView } from "@/components/dashboard-view";
import { getDashboardStats } from "@/lib/db";
import { todayKey } from "@/lib/date";

export const runtime = "nodejs";

export default async function DashboardPage() {
  await connection();
  const stats = getDashboardStats(todayKey());
  return <DashboardView stats={stats} />;
}
