"use client";

import { createSupabaseClientForClientSide } from "@/utils/supabase/client";
import {
  SelectExperiment,
  SelectVariant,
  SelectVariantPerExperiment,
} from "@web3socialproof/db";
import { BarChart, PauseCircle, PlayCircle, Table } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Bar,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  BarChart as RechartsBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "./ui/chart";
import { Skeleton } from "./ui/skeleton";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

export type VariantDetailsResults = {
  totalImpressions: number;
  totalConversions: number;

  dailyImpressions: {
    date: string;
    count: number;
  }[];

  dailyConversions: {
    date: string;
    count: number;
  }[];
};

export type VariantDataDetails = {
  details: SelectVariant;
  percentage: number;
  results: VariantDetailsResults;
};

export function ExperimentTable({
  variants,
  isLoading,
}: {
  isLoading?: boolean;
  variants?: Partial<VariantDataDetails>[];
}) {
  if (isLoading) {
    return <Skeleton className="h-96" />;
  }

  if (!variants) {
    return null;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Variant</TableHead>
          <TableHead>Traffic Split</TableHead>
          <TableHead>Impressions</TableHead>
          <TableHead>Conversions</TableHead>
          <TableHead>Conversion Rate</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {variants.map((variant) => (
          <TableRow key={variant?.details?.id}>
            <TableCell className="font-medium">
              {variant?.details?.name}
            </TableCell>
            <TableCell>{variant.percentage}%</TableCell>
            <TableCell>{variant?.results?.totalImpressions}</TableCell>
            <TableCell>{variant.results?.totalConversions}</TableCell>
            <TableCell>
              {variant.results?.totalImpressions &&
              variant.results?.totalConversions
                ? (
                    (variant.results?.totalConversions /
                      variant.results?.totalImpressions) *
                    100
                  ).toFixed(2)
                : 0}
              %
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function ExperimentChart({
  variants,
  isLoading,
}: {
  isLoading?: boolean;
  variants?: Partial<VariantDataDetails>[];
}) {
  if (isLoading) {
    return <Skeleton className="h-96" />;
  }

  if (!variants) {
    return null;
  }

  const data = variants?.map((variant) => ({
    name: variant?.details?.name,
    "Conversion Rate":
      variant?.results?.totalImpressions && variant?.results?.totalConversions
        ? (
            (variant?.results?.totalConversions /
              variant?.results?.totalImpressions) *
            100
          ).toFixed(2)
        : 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsBarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="Conversion Rate" fill="#8884d8" />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}

export default function ExperimentDetail({ id }: { id: number }) {
  const supabase = createSupabaseClientForClientSide();
  const [isLoading, setIsLoading] = useState(true);
  const [experiment, setExperiment] = useState<SelectExperiment | null>(null);
  const [variantsPerExperiment, setVariantsPerExperiment] = useState<
    SelectVariantPerExperiment[] | null
  >();
  const [variants, setVariants] = useState<SelectVariant[] | null>();
  const [loadingVariants, setLoadingVariants] = useState(true);

  useEffect(() => {
    async function fetchExperiment() {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("experiments_table")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          throw error;
        }

        setExperiment(data);
      } catch (error) {
        console.error("Failed to fetch experiment:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (!id) return;

    fetchExperiment();
  }, [id, supabase]);

  async function fetchVariants() {
    try {
      setLoadingVariants(true);
      const { data, error } = await supabase
        .from("variants_per_experiment_table")
        .select("*")
        .eq("experiment_id", id);

      if (error || !data) {
        throw error;
      }

      const { data: variants } = await supabase
        .from("variants_table")
        .select("*")
        .in(
          "id",
          data.map((v) => v.variant_id)
        );

      if (error || !variants) {
        throw error;
      }

      setVariantsPerExperiment(data);
      setVariants(variants);
    } catch (error) {
      console.error("Failed to fetch variants:", error);
    } finally {
      setLoadingVariants(false);
    }
  }

  const [variantsDataLoading, setVariantsDataLoading] = useState(true);
  const [variantsData, setVariantsData] = useState<
    Partial<VariantDataDetails>[] | undefined
  >();

  const [totalImpressions, setTotalImpressions] = useState<number | null>(null);
  const [totalConversions, setTotalConversions] = useState<number | null>(null);

  useEffect(() => {
    async function fetchData() {
      setVariantsDataLoading(true);
      const response = await fetch(`/experiments/${id}/api`);
      const result: {
        totalImpressions: number;
        totalConversions: number;
        variantsResults: Record<string, VariantDetailsResults>;
      } = await response.json();

      const variantsData = Object.keys(result.variantsResults).map((key) => {
        const variant = variants?.find((v) => v.id === Number(key));
        const variantPercentage = variantsPerExperiment?.find(
          (v) => v.variant_id === Number(key)
        )?.percentage;

        return {
          details: variant,
          percentage: variantPercentage,
          results: result.variantsResults[key],
        };
      });

      setVariantsData(variantsData);
      setTotalImpressions(result.totalImpressions);
      setTotalConversions(result.totalConversions);

      setVariantsDataLoading(false);
    }
    fetchData();
  }, [supabase, id, variants, variantsPerExperiment]);

  if (isLoading) {
    // todo Skeleton
    return <Skeleton className="h-96" />;
  }

  type dailyData = {
    date: string;
    [key: string]: number | string;
  };

  // Join all variants per date
  const chartData = variantsData?.reduce((acc, variant) => {
    variant?.results?.dailyImpressions.forEach((impression) => {
      const date = impression.date;
      const existing = acc.find((d) => d.date === date);

      if (existing != undefined) {
        existing[variant?.details?.id + "_impressions"] =
          Number(existing[variant?.details?.id + "_impressions"]) +
          impression.count;
      } else {
        acc.push({
          date,
          [variant?.details?.id + "_impressions"]: impression.count,
        });
      }
    });

    variant?.results?.dailyConversions.forEach((conversion) => {
      const date = conversion.date;
      const existing = acc.find((d) => d.date === date);

      if (existing != undefined) {
        existing[variant?.details?.id + "_conversions"] =
          Number(existing[variant?.details?.id + "_conversions"]) +
          conversion.count;
      } else {
        acc.push({
          date,
          [variant?.details?.id + "_conversions"]: conversion.count,
        });
      }
    });

    return acc;
  }, [] as dailyData[]);

  const chartConfig =
    variantsData
      ?.flatMap((variant) => {
        if (variant?.details?.name) {
          return [
            {
              id: variant?.details?.id + "_impressions",
              label: variant?.details?.name,
              color: "hsl(var(--chart-1))",
            },
            {
              id: variant?.details?.id + "_conversions",
              label: variant?.details?.name,
              color: "hsl(var(--chart-2))",
            },
          ];
        }
      })
      .filter((v) => v !== undefined)
      .reduce(
        (acc, v) => {
          acc[v.id.toString()] = {
            label: v.label,
            color: v.color,
          };
          return acc;
        },
        {} as Record<
          string,
          {
            label: string;
            color: string;
          }
        >
      ) ?? ({} satisfies ChartConfig);

  console.log(chartData, chartConfig);

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{experiment?.name}</CardTitle>
              {/* <CardDescription>{experiment.description}</CardDescription> */}
            </div>
            <Badge variant={experiment?.enabled ? "default" : "secondary"}>
              {experiment?.enabled ? (
                <PlayCircle className="mr-1 h-4 w-4" />
              ) : (
                <PauseCircle className="mr-1 h-4 w-4" />
              )}
              {experiment?.enabled ? "Running" : "Paused"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Created</CardTitle>
                <BarChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {experiment?.created_at && (
                  <div className="text-2xl font-bold">
                    {new Date(experiment?.created_at).toLocaleDateString()}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Domains</CardTitle>
                <BarChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {experiment?.hostnames?.length || "Any"}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Impressions
                </CardTitle>
                <BarChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalImpressions}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Conversions
                </CardTitle>
                <BarChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalConversions}</div>
              </CardContent>
            </Card>
          </div>

          {totalImpressions && totalImpressions > 0 ? (
            <>
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">
                  Experiment Results
                </h3>
                <ExperimentChart
                  isLoading={variantsDataLoading}
                  variants={variantsData}
                />
              </div>
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Detailed Metrics</h3>
                <ExperimentTable
                  isLoading={variantsDataLoading}
                  variants={variantsData}
                />
              </div>
            </>
          ) : (
            <div className="mt-6">
              <h3 className="text-lg mb-2">
                No data available. Are you sure that the pixel is properly
                integrated in the selected domains?
              </h3>
            </div>
          )}
        </CardContent>{" "}
      </Card>

      {!!totalImpressions &&
        totalImpressions > 0 &&
        (variantsDataLoading ? (
          <Skeleton className="h-64" />
        ) : (
          <Card>
            <CardContent className="pt-4">
              <h2 className="text-lg font-semibold">Daily Performance</h2>
              <label className="text-muted-foreground">
                Variants Evolution
              </label>
              <br />
              <ChartContainer config={chartConfig}>
                <LineChart
                  data={chartData}
                  margin={{
                    left: 12,
                    right: 12,
                  }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <YAxis
                    min={0}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    allowDecimals={false}
                    max={Math.max(
                      ...(chartData?.map((d: any) => d.impressions) ?? []),
                      ...(chartData?.map((d: any) => d.conversions) ?? [])
                    )}
                  />

                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="line" />}
                  />
                  <Line
                    dataKey="impressions"
                    type="natural"
                    fill="var(--color-impressions)"
                    fillOpacity={0.4}
                    stroke="var(--color-impressions)"
                  />
                  <Line
                    dataKey="conversions"
                    type="natural"
                    fill="var(--color-conversions)"
                    fillOpacity={0.4}
                    stroke="var(--color-conversions)"
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        ))}
    </div>
  );
}
