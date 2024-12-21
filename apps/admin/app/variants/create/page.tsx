"use client";

import VariantsForm from "@/components/VariantsForm";
import { toast } from "@/hooks/use-toast";
import { useUserContext } from "@/lib/context/useUserContext";
import { createSupabaseClientForClientSide } from "@/utils/supabase/client";
import { InsertVariant } from "@web3socialproof/db";
import { NotificationStylingRequired } from "@web3socialproof/shared/constants";
import { useRouter } from "next/navigation";

export default function CreateVariant() {
  const router = useRouter();
  const supabase = createSupabaseClientForClientSide();
  const { protocol } = useUserContext();

  const handleCreate = async (
    formData: InsertVariant & { styling: NotificationStylingRequired }
  ) => {
    try {
      const { data, error } = await supabase.from("variants_table").insert({
        ...formData,
        protocol_id: protocol?.id,
      });

      if (error) {
        console.error("Failed to create variant:", error);
        throw new Error("Failed to create variant");
      }

      toast({
        title: "Variant created",
        description: "The variant was successfully created.",
      });

      router.push("/variants");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return <VariantsForm onSubmit={handleCreate} />;
}
