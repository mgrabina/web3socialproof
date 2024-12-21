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
import { SelectMetric } from "@web3socialproof/db";
import { Edit, Pause, Play, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LoadingTable } from "./LoadingTable";

export default function MetricsManager() {
  const [metrics, setMetrics] = useState<SelectMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createSupabaseClientForClientSide();
  const { protocol } = useUserContext();

  useEffect(() => {
    async function fetchMetrics() {
      try {
        setIsLoading(true);
        if (!protocol?.id) {
          throw new Error("No protocol found.");
        }

        let { data: metrics, error } = await supabase
          .from("metrics_table")
          .select()
          .filter("protocol_id", "eq", protocol?.id);
        if (error || !metrics) throw error;

        const parsed = metrics.map((m) => ({
          ...m,
          ...(m.last_calculated !== null
            ? { last_calculated: new Date(m.last_calculated) }
            : { last_calculated: null }),
        }));

        setMetrics(parsed);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch metrics:", error);
        toast({
          title: "Error",
          description: "Failed to fetch metrics.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    if (protocol) {
      fetchMetrics();
    }
  }, [protocol]);

  const handleDeleteMetric = async (metricId: number) => {
    // using supabase
    async function deleteMetric(metricId: number) {
      const { error } = await supabase
        .from("metrics_table")
        .delete()
        .eq("id", metricId);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to delete metric.",
          variant: "destructive",
        });
      } else {
        setMetrics(metrics.filter((m) => m.id !== metricId));
        toast({
          title: "Success!",
          description: "Metric deleted successfully.",
        });
      }
    }

    try {
      setIsLoading(true);
      await deleteMetric(metricId);
      setIsLoading(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete metric.",
        variant: "destructive",
      });
    }
  };

  const handlePauseOrPlayMetric = async (metric: SelectMetric) => {
    async function pauseOrPlayMetric(metricId: number, enabled: boolean) {
      const { error } = await supabase
        .from("metrics_table")
        .update({ enabled })
        .eq("id", metricId);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update metric.",
          variant: "destructive",
        });
      } else {
        setMetrics((prevMetrics) =>
          prevMetrics.map((m) => (m.id === metricId ? { ...m, enabled } : m))
        );
        toast({
          title: "Success!",
          description: `Metric ${enabled ? "enabled" : "paused"} successfully.`,
        });
      }
    }

    try {
      setIsLoading(true);
      await pauseOrPlayMetric(metric.id, !metric.enabled);
      setIsLoading(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update metric.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Metrics</h1>
        <a href="/metrics/create">
          <Button className="gap-2">Create Metric</Button>
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
                  <TableHead>Description</TableHead>
                  <TableHead>Calculation Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics?.map((metric) => (
                  <TableRow key={metric.id}>
                    <TableCell>{metric.name}</TableCell>
                    <TableCell>{metric.description}</TableCell>
                    <TableCell>{metric.calculation_type}</TableCell>
                    <TableCell>
                      {metric.enabled ? "Active" : "Paused"}
                    </TableCell>
                    <TableCell className="text-right">
                      {/* Pause or Play */}
                      {metric.enabled ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePauseOrPlayMetric(metric)}
                        >
                          <Pause className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePauseOrPlayMetric(metric)}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/metrics/${metric.id}`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteMetric(metric.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {metrics.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No metrics found. Create a new one by clicking the button
                      above.
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
