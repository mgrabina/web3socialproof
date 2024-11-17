"use client";

import MetricsForm from "@/components/MetricsForm";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";

export default function EditMetric({ metric }: { metric: any }) {
  const router = useRouter();

  const handleEdit = async (formData: any) => {
    try {
      const response = await fetch(`/metrics/api/${metric.id}`, {
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

  return <MetricsForm initialData={metric} onSubmit={handleEdit} />;
}
