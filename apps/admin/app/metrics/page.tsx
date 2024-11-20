import { redirect } from "next/navigation";

import Dashboard from "@/components/Dashboard";
import Campaigns from "@/components/Campaigns";
import MetricsManager from "@/components/Metrics";

export default async function DashboardWrapper() {
  return <MetricsManager />;
}
