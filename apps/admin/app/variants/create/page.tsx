"use client";

import VariantsForm from "@/components/VariantsForm";
import { useUserContext } from "@/lib/context/useUserContext";
import { createSupabaseClientForClientSide } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function CreateVariant() {
  const router = useRouter();
  const supabase = createSupabaseClientForClientSide();
  const { protocol } = useUserContext();

  const handleCreate = async (formData: any) => {
    try {
      const { data, error } = await supabase.from("variants_table").insert({
        ...formData,
        protocol_id: protocol?.id,
      });

      if (error) {
        throw new Error("Failed to create variant");
      }

      router.push("/variants");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return <VariantsForm onSubmit={handleCreate} />;
}
