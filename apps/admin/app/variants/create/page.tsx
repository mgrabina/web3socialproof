"use client";

import VariantsForm from "@/components/VariantsForm";
import { useRouter } from "next/navigation";

export default function CreateVariant() {
  const router = useRouter();

  const handleCreate = async (formData: any) => {
    try {
      const response = await fetch("/variants/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        router.push("/variants");
      } else {
        throw new Error("Failed to create variant");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return <VariantsForm onSubmit={handleCreate} />;
}
