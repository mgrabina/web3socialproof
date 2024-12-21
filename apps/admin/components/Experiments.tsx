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
import { Edit, Eye, Pause, Play, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LoadingTable } from "./LoadingTable";
import { Skeleton } from "./ui/skeleton";

export default function ExperimentManager() {
  const [experiments, setExperiments] = useState<SelectExperiment[] | null>();
  const [variantsPerExperiment, setVariantsPerExperiment] = useState<
    SelectVariantPerExperiment[] | null
  >();
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStatistics, setLoadingStatistics] = useState(false);
  const [impressionsPerExperiment, setImpressionsPerExperiment] =
    useState<Record<number, number> | null>();
  const [conversionsPerExperiment, setConversionsPerExperiment] = useState<
    Record<
      number,
      {
        withVariant: number;
        withoutVariant: number;
      } | null
    >
  >();

  const router = useRouter();
  const { protocol } = useUserContext();
  const supabase = createSupabaseClientForClientSide();

  useEffect(() => {
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

    if (!protocol) {
      return;
    }
    fetchExperiments();
  }, [protocol, supabase]);

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

  useEffect(() => {
    if (!protocol) {
      return;
    }

    const fetchImpressionsPerExperiment = async () => {
      setLoadingStatistics(true);
      try {
        const { data, error } = await supabase
          .from("impressions_table")
          .select("*")
          .eq("protocol_id", protocol?.id)
          .in(
            "experiment_id",
            experiments?.map((e) => e.id).filter((id) => id !== undefined) || []
          );

        if (error) {
          throw error;
        }

        setImpressionsPerExperiment(
          data?.reduce((acc, impression) => {
            if (!impression.experiment_id) {
              return acc;
            }

            if (impression.experiment_id in acc) {
              acc[impression.experiment_id] += 1;
            } else {
              acc[impression.experiment_id] = 1;
            }
            return acc;
          }, {} as Record<number, number>)
        );

        const { data: conversions, error: conversionError } = await supabase
          .from("conversions_table")
          .select("*")
          .eq("protocol_id", protocol?.id)
          .in(
            "experiment_id",
            experiments?.map((e) => e.id).filter((id) => id !== undefined) || []
          );

        if (conversionError) {
          throw conversionError;
        }

        setConversionsPerExperiment(
          conversions?.reduce(
            (acc, conversion) => {
              if (!conversion.experiment_id) {
                return acc;
              }

              if (conversion.experiment_id in acc) {
                if (conversion.variant_id !== null) {
                  acc[conversion.experiment_id].withVariant += 1;
                } else {
                  acc[conversion.experiment_id].withoutVariant += 1;
                }
              } else {
                if (conversion.variant_id !== null) {
                  acc[conversion.experiment_id] = {
                    withVariant: 1,
                    withoutVariant: 0,
                  };
                } else {
                  acc[conversion.experiment_id] = {
                    withVariant: 0,
                    withoutVariant: 1,
                  };
                }
              }
              return acc;
            },
            {} as Record<
              number,
              {
                withVariant: number;
                withoutVariant: number;
              }
            >
          )
        );
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch experiment results.",
          variant: "destructive",
        });

        console.error("Error fetching experiment results:", error);
      } finally {
        setLoadingStatistics(false);
      }
    };

    fetchImpressionsPerExperiment();
  }, [protocol, experiments, supabase]);

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
                  <TableHead>Domains</TableHead>
                  <TableHead>Impressions</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {experiments?.map((experiment) => (
                  <TableRow key={experiment.id}>
                    <TableCell>
                      <Link
                        className="text-blue-600 hover:underline hover:text-blue-800 transition-all"
                        href={`/experiments/${experiment.id}`}
                      >
                        {experiment.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {experiment.enabled ? "Active" : "Paused"}
                    </TableCell>
                    <TableCell>
                      {variantsPerExperiment?.filter(
                        (v) => v.experiment_id === experiment.id
                      ).length || "0"}
                    </TableCell>
                    <TableCell>{experiment.hostnames}</TableCell>
                    <TableCell>
                      {loadingStatistics ? (
                        <Skeleton className="w-16 h-4" />
                      ) : (
                        impressionsPerExperiment?.[experiment.id]
                      )}
                    </TableCell>
                    <TableCell>
                      {loadingStatistics ? (
                        <Skeleton className="w-16 h-4" />
                      ) : conversionsPerExperiment?.[experiment.id] != null ? (
                        `${
                          (conversionsPerExperiment[experiment.id]!
                            .withVariant /
                            conversionsPerExperiment[experiment.id]!
                              .withoutVariant) *
                            100 -
                          100
                        }%`
                      ) : (
                        "No data"
                      )}
                    </TableCell>
                    <TableCell className="text-right flex space-x-2 justify-end">
                      {/* Eye Button for details */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          router.push(`/experiments/${experiment.id}`)
                        }
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      {/* Edit Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          router.push(`/experiments/create/${experiment.id}`)
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
