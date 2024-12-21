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
    formData: InsertVariant & { styling: NotificationStylingRequired },
    createABTesting: boolean
  ) => {
    try {
      const { data: variant, error } = await supabase
        .from("variants_table")
        .insert({
          ...formData,
          protocol_id: protocol?.id,
        })
        .select()
        .single();

      if (error) {
        console.error("Failed to create variant:", error);
        throw new Error("Failed to create variant");
      }

      toast({
        title: "Variant created",
        description: "The variant was successfully created.",
      });

      if (createABTesting) {
        try {

          // Create experiment using 95% for the varaint and 5% for empty
          const { data: experiment, error } = await supabase
            .from("experiments_table")
            .insert({
              name: "A/B Testing: " + formData.name,
              protocol_id: protocol?.id,
            })
            .select()
            .single();
  
          if (error) {
            console.error("Failed to create experiment:", error);
            throw new Error("Failed to create experiment");
          }
  
          // add variants to experiment
          const { data: abTestingError } = await supabase
            .from("variants_per_experiment_table")
            .insert([
              {
                experiment_id: experiment.id,
                variant_id: variant.id,
                percentage: 95,
              },
              {
                experiment_id: experiment.id,
                percentage: 5,
              },
            ]);
  
          if (abTestingError) {
            console.error("Failed to create A/B testing:", abTestingError);
            throw new Error("Failed to create A/B testing");
          }
  
          toast({
            title: "A/B Testing created",
            description: "The A/B testing was successfully created, you can find it in your experiments overview page.",
          });
        } catch (error) {
          console.error("Failed to create A/B testing:", error);
          toast({
            title: "Error",
            description: "Failed to create A/B testing. Please create it manually.",
            variant: "destructive",
          });
        }
      }

      router.push("/variants");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return <VariantsForm onSubmit={handleCreate} />;
}
