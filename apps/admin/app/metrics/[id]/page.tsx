"use client";

import MetricsForm from "@/components/MetricsForm";
import { toast } from "@/hooks/use-toast";
import { createSupabaseClientForClientSide } from "@/utils/supabase/client";
import { SelectLog, SelectMetric } from "@web3socialproof/db";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditMetric() {
  const { id } = useParams();
  const router = useRouter();

  const [initialData, setInitialData] = useState<
    | {
        metric: SelectMetric;
        variables: SelectLog[];
      }
    | undefined
  >();

  const supabase = createSupabaseClientForClientSide();

  useEffect(() => {
    const fetchVariant = async () => {
      try {
        let { data: metricFromDb, error } = await supabase
          .from("metrics_table")
          .select("*")
          .eq("id", id)
          .single();

        if (error || !metricFromDb) {
          throw new Error("Failed to fetch metric");
        }

        let metricParsed = {
          ...metricFromDb,
          ...(metricFromDb?.last_calculated !== null &&
          metricFromDb?.last_calculated !== undefined
            ? { last_calculated: new Date(metricFromDb.last_calculated) }
            : { last_calculated: null }),
        };

        setInitialData({
          metric: metricParsed,
          variables: [],
        });
      } catch (error) {
        console.error("Error fetching variant:", error);
      }
    };
    fetchVariant();
  }, [id, router, supabase]);

  const handleEdit = async (formData: any) => {
    try {
      const { error } = await supabase
        .from("metrics_table")
        .update({
          ...formData,
          id: Number(id),
        })
        .eq("id", id);

      if (error) {
        throw new Error("Failed to update metric");
      }

      toast({
        title: "Success!",
        description: "Metric updated successfully.",
      });

      router.push("/metrics");
    } catch (error) {
      console.error("Error updating metric:", error);
      toast({
        title: "Error",
        description: "Failed to update metric.",
        variant: "destructive",
      });
    }
  };

  return <MetricsForm initialData={initialData} onSubmit={handleEdit} />;
}
