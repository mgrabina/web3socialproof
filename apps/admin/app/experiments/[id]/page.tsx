"use client";

import ExperimentDetail from "@/components/ExperimentDetail";
import { useParams } from "next/navigation";

export default function ExperimentDetailPage() {
  const params = useParams();

  const id = params.id;

  return <ExperimentDetail id={Number(id.toString())} />;
}
