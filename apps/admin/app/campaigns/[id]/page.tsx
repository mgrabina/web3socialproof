"use client";

import CampaignForm from "@/components/CampaignForm";
import { Skeleton } from "@/components/ui/skeleton";
import { InsertCampaign, SelectCampaign } from "@web3socialproof/db";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditCampaign() {
  const router = useRouter();
  const { id } = useParams();
  const [initialData, setInitialData] = useState<SelectCampaign | undefined>();

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const response = await fetch(`/campaigns/api/${id}`);
        let data: SelectCampaign = await response.json();

        setInitialData(data);
      } catch (error) {
        console.error("Error fetching campaign:", error);
      }
    };
    fetchCampaign();
  }, [id]);

  const handleUpdate = async (formData: InsertCampaign) => {
    try {
      const response = await fetch(`/campaigns/api/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        router.push("/campaigns");
      } else {
        throw new Error("Failed to update campaign");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  if (!initialData)
    // Two columns of skeleton loaders
    return (
      <div className="flex flex-row space-x-4 p-6">
        <Skeleton className="w-1/2 h-[500px]" />
        <Skeleton className="w-1/2 h-[100px]" />
      </div>
    );

  return <CampaignForm initialData={initialData} onSubmit={handleUpdate} />;
}
