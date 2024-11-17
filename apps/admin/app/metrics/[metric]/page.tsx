"use client";

import MetricsForm from "@/components/MetricsForm";
import { useParams, useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { SelectLog, SelectMetric } from "@web3socialproof/db";
import { useEffect, useState } from "react";

export default function EditMetric() {
  const { metric } = useParams();
  const router = useRouter();

  const [initialData, setInitialData] = useState<
    | {
        metric: SelectMetric;
        variables: SelectLog[];
      }
    | undefined
  >();

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const response = await fetch(`/metrics/api/${metric}`);
        let data: {
          metric: SelectMetric;
          variables: SelectLog[];
        } = await response.json();

        setInitialData(data);
      } catch (error) {
        console.error("Error fetching campaign:", error);
      }
    };
    fetchCampaign();
  }, [metric]);

  const handleEdit = async (formData: any) => {
    try {
      const response = await fetch(`/metrics/api/${metric}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to update metric");
      }

      toast({
        title: "Metric Updated",
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
