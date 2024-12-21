"use client";

import VariantsForm from "@/components/VariantsForm";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { useUserContext } from "@/lib/context/useUserContext";
import { createSupabaseClientForClientSide } from "@/utils/supabase/client";
import { InsertVariant, SelectVariant } from "@web3socialproof/db";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditVariant() {
  const router = useRouter();
  const { id } = useParams();
  const [initialData, setInitialData] = useState<SelectVariant | undefined>();

  const supabase = createSupabaseClientForClientSide();
  const { protocol } = useUserContext();

  useEffect(() => {
    const fetchVariant = async () => {
      try {
        const { data: variantFromDb, error } = await supabase
          .from("variants_table")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          throw new Error("Failed to fetch variants");
        }

        setInitialData(variantFromDb);
      } catch (error) {
        console.error("Error fetching variant:", error);
      }
    };
    fetchVariant();
  }, [id, supabase]);

  const handleUpdate = async (formData: InsertVariant) => {
    try {
      const { error } = await supabase
        .from("variants_table")
        .update({
          ...formData,
          id: Number(id),
          styling: formData.styling as any,
        })
        .eq("id", id);

      if (error) {
        throw new Error("Failed to update variant");
      }

      toast({
        title: "Success",
        description: "Variant updated successfully",
      });

      router.push("/variants");
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
