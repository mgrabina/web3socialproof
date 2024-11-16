"use client";

import CampaignForm from "@/components/CampaignForm";
import { useRouter } from "next/navigation";

export default function CreateCampaign() {
  const router = useRouter();

  const handleCreate = async (formData: any) => {
    try {
      const response = await fetch("/campaigns/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        router.push("/campaigns");
      } else {
        throw new Error("Failed to create campaign");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return <CampaignForm onSubmit={handleCreate} />;
}
