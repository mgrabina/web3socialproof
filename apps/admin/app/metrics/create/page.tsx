"use client";

import MetricsForm from "@/components/MetricsForm";
import { toast } from "@/hooks/use-toast";
import { useUserContext } from "@/lib/context/useUserContext";
import { createSupabaseClientForClientSide } from "@/utils/supabase/client";
import { InsertLog, InsertMetric } from "@web3socialproof/db";
import { useRouter } from "next/navigation";

export default function CreateMetric() {
  const router = useRouter();
  const supabase = createSupabaseClientForClientSide();
  const { protocol } = useUserContext();

  const handleCreate = async (formData: {
    metric: InsertMetric;
    variables: InsertLog[];
  }) => {
    try {
      const parsed = {
        ...formData.metric,
        last_calculated: formData.metric.last_calculated?.toISOString(),
      };

      const { data, error } = await supabase
        .from("metrics_table")
        .insert({
          ...parsed,
          protocol_id: protocol?.id,
          calculation_type: "sum",
          description: parsed.description ?? "",
        })
        .select()
        .single();

      if (error) {
        throw new Error("Failed to create metric");
      }

      // Insert logs

      const parsedLogs = formData.variables.map((v) => ({
        ...v,
        current_result: Number(v.current_result),
        protocol_id: protocol?.id,
      }));

      const { data: variables, error: logError } = await supabase
        .from("logs_table")
        .insert(parsedLogs)
        .select();

      const { data: relation, error: relationError } = await supabase
        .from("metrics_variables_table")
        .insert(
          variables?.map((v) => ({
            metric_id: data.id,
            variable_id: v.id,
          })) ?? []
        )
        .select();

      if (logError || relationError) {
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
