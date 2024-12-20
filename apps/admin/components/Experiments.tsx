"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { useUserContext } from "@/lib/context/useUserContext";
import { createSupabaseClientForClientSide } from "@/utils/supabase/client";
import {
  SelectExperiment,
  SelectVariantPerExperiment,
} from "@web3socialproof/db";
import { Edit, Pause, Play, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LoadingTable } from "./LoadingTable";

export default function ExperimentManager() {
  const [experiments, setExperiments] = useState<SelectExperiment[] | null>();
  const [variantsPerExperiment, setVariantsPerExperiment] = useState<
    SelectVariantPerExperiment[] | null
  >();
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createSupabaseClientForClientSide();
  const { protocol } = useUserContext();

  async function fetchExperiments() {
    try {
      setIsLoading(true);
      if (!protocol?.id) {
        throw new Error("No protocol found.");
      }

      let { data: experiments, error } = await supabase
        .from("experiments_table")
        .select()
        .filter("protocol_id", "eq", protocol?.id);
      if (error || !experiments) throw error;

      setExperiments(experiments);

      let { data: variantsPerExperiment, error: variantsPerExpError } =
        await supabase
          .from("variants_per_experiment_table")
          .select()
          .in(
            "experiment_id",
            experiments.map((e) => e.id)
          );

      if (variantsPerExpError || !variantsPerExperiment?.length)
        throw variantsPerExpError;

      setVariantsPerExperiment(variantsPerExperiment);
    } catch (error) {
      console.error("Error fetching experiments:", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    // Initial
    fetchExperiments();
  }, [protocol]);

  const handleDeleteExperiment = async (experimentId: number) => {
    try {
      const { data: updatedExperiments, error } = await supabase
        .from("experiments_table")
        .delete()
        .eq("id", experimentId)
        .select();

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Experiment deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete experiment.",
        variant: "destructive",
      });
    }
  };

  const handleToggleExperimentStatus = async (experiment: SelectExperiment) => {
    try {
      const { data: updatedExperiment, error } = await supabase
        .from("experiments_table")
        .update({ enabled: !experiment.enabled })
        .eq("id", experiment.id)
        .select();

      if (error || !updatedExperiment.length) throw error;

      setExperiments((prevExperiments) =>
        prevExperiments?.map((c) =>
          c.id === experiment.id ? updatedExperiment[0] : c
        )
      );

      toast({
        title: `Experiment ${experiment.enabled ? "Paused" : "Activated"}`,
        description: `Experiment "${experiment.name}" has been ${
          experiment.enabled ? "paused" : "activated"
        }.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update experiment status.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Experiments</h1>
        <a href="/experiments/create">
          <Button className="gap-2">Create Experiment</Button>
        </a>
      </div>

      <Card>
        <CardContent>
          {isLoading ? (
            <LoadingTable />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Variants</TableHead>
                  <TableHead>Creation Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {experiments?.map((experiment) => (
                  <TableRow key={experiment.id}>
                    <TableCell>{experiment.name}</TableCell>
                    <TableCell>
                      {experiment.enabled ? "Active" : "Paused"}
                    </TableCell>
                    <TableCell>
                      {variantsPerExperiment?.filter(
                        (v) => v.experiment_id === experiment.id
                      ).length || "0"}
                    </TableCell>
                    <TableCell>
                      {new Date(experiment.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right flex space-x-2 justify-end">
                      {/* Edit Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          router.push(`/experiments/${experiment.id}`)
                        }
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {/* Pause/Resume Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleExperimentStatus(experiment)}
                      >
                        {experiment.enabled ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      {/* Delete Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteExperiment(experiment.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {!experiments?.length && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No experiments found. Create a new one by clicking the
                      button above.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
