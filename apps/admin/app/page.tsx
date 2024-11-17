import { redirect } from "next/navigation";

import { createSupabaseClientForServerSide } from "@/utils/supabase/server";
import Dashboard from "@/components/Dashboard";

export default async function DashboardWrapper() {
  return <Dashboard />;
}
