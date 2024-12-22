"use client";

import ExperimentsForm from "@/components/ExperimentsForm";
import { useParams, useRouter } from "next/navigation";

export default function EditExperiment() {
  const { id } = useParams();

  return <ExperimentsForm id={Number(id.toString())} />;
}
