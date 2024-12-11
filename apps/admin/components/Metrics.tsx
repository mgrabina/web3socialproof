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
import { SelectMetric } from "@web3socialproof/db";
import { Edit, Pause, Play, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LoadingTable } from "./LoadingTable";

export default function MetricsManager() {
  const [metrics, setMetrics] = useState<SelectMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchMetrics() {
      setIsLoading(true);
      try {
        const response = await fetch("/metrics/api");
        const data = await response.json();
        setMetrics(data);
      } catch (error) {
        console.error("Error fetching metrics:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchMetrics();
  }, []);

  const handleDeleteMetric = async (metricId: number) => {
    try {
      await fetch(`/metrics/api/${metricId}`, {
        method: "DELETE",
      });
      setMetrics(metrics.filter((m) => m.id !== metricId));
      toast({
        title: "Success!",
        description: "Metric deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete metric.",
        variant: "destructive",
      });
    }
  };

  const handlePauseMetric = async (metricId: number) => {
    try {
      await fetch(`/metrics/api/${metricId}/pause`, {
        method: "POST",
      });
      setMetrics(
        metrics.map((m) => (m.id === metricId ? { ...m, enabled: false } : m))
      );
      toast({
        title: "Success!",
        description: "Metric paused successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to pause metric.",
        variant: "destructive",
      });
    }
  };

  const handlePlayMetric = async (metricId: number) => {
    try {
      await fetch(`/metrics/api/${metricId}/play`, {
        method: "POST",
      });
      setMetrics(
        metrics.map((m) => (m.id === metricId ? { ...m, enabled: true } : m))
      );
      toast({
        title: "Success!",
        description: "Metric played successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to play metric.",
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
                          onClick={() => handlePauseMetric(metric.id)}
                        >
                          <Pause className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePlayMetric(metric.id)}
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
