"use client";

import MetricsForm from "@/components/MetricsForm";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";

export default function CreateMetric() {
  const router = useRouter();

  const handleCreate = async (formData: any) => {
    try {
      const response = await fetch("/metrics/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to create metric");
      }

      toast({
        title: "Metric Created",
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
