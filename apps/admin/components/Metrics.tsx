"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RefreshCw, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { metricsTable, SelectMetric } from "@web3socialproof/db";
import { LoadingTable } from "./LoadingTable";

export default function MetricsManager() {
  const [metrics, setMetrics] = useState<SelectMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
        title: "Metric Deleted",
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
                {metrics.map((metric) => (
                  <TableRow key={metric.id}>
                    <TableCell>{metric.name}</TableCell>
                    <TableCell>{metric.description}</TableCell>
                    <TableCell>{metric.calculation_type}</TableCell>
                    <TableCell>
                      {metric.enabled ? "Active" : "Paused"}
                    </TableCell>
                    <TableCell className="text-right">
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
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
