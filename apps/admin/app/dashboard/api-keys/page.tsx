import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";
import Dashboard from "@/components/Dashboard";
import Campaigns from "@/components/Campaigns";
import SaasApiKeyManager from "@/components/ApiKeysManager";

export default async function DashboardWrapper() {
  const supabase = createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/login");
  }

  return <SaasApiKeyManager />;
}
