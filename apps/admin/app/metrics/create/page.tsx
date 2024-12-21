"use client";

import MetricsForm from "@/components/MetricsForm";
import { toast } from "@/hooks/use-toast";
import { useUserContext } from "@/lib/context/useUserContext";
import { createSupabaseClientForClientSide } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function CreateMetric() {
  const router = useRouter();
  const supabase = createSupabaseClientForClientSide();
  const { protocol } = useUserContext();

  const handleCreate = async (formData: any) => {
    try {
      const { data, error } = await supabase.from("metrics_table").insert({
        ...formData,
        protocol_id: protocol?.id,
      });

      if (error) {
        throw new Error("Failed to create metric");
      }

      toast({
        title: "Success!",
        description: "Metric created successfully.",
      });

      router.push("/metrics");
    } catch (error) {
      console.error("Error creating metric:", error);
      toast({
        title: "Error",
        description: "Failed to create metric.",
        variant: "destructive",
      });
    }
  };

  return <MetricsForm onSubmit={handleCreate} />;
}
