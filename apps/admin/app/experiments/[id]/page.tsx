"use client";

import VariantsForm from "@/components/VariantsForm";
import { Skeleton } from "@/components/ui/skeleton";
import { InsertVariant, SelectVariant } from "@web3socialproof/db";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditVariant() {
  const router = useRouter();
  const { id } = useParams();
  const [initialData, setInitialData] = useState<SelectVariant | undefined>();

  useEffect(() => {
    const fetchVariant = async () => {
      try {
        const response = await fetch(`/variants/api/${id}`);
        let data: SelectVariant = await response.json();

        setInitialData(data);
      } catch (error) {
        console.error("Error fetching variant:", error);
      }
    };
    fetchVariant();
  }, [id]);

  const handleUpdate = async (formData: InsertVariant) => {
    try {
      const response = await fetch(`/variants/api/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        router.push("/variants");
      } else {
        throw new Error("Failed to update variant");
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

  return <VariantsForm initialData={initialData} onSubmit={handleUpdate} />;
}
