"use client";

import { createSupabaseClientForClientSide } from "@/utils/supabase/client";
import {
  SelectExperiment,
  SelectVariant,
  SelectVariantPerExperiment,
} from "@web3socialproof/db";
import { PauseCircle, PlayCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
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
  Table,
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
  id: number;
  results: VariantDetailsResults;
};

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

  
  useEffect(() => {
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
            data.map((v) => v.variant_id).filter((v) => !!v)
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

    if (!id) return;
    fetchVariants();
  }, [id, supabase]);

  const [variantsDataLoading, setVariantsDataLoading] = useState(true);
  const [variantsData, setVariantsData] = useState<
    Partial<VariantDataDetails>[] | undefined
  >();

  const [totalImpressions, setTotalImpressions] = useState<number | null>(null);
  const [totalConversions, setTotalConversions] = useState<number | null>(null);

  const router = useRouter();
  useEffect(() => {
    async function fetchData() {
      setVariantsDataLoading(true);
      const response = await fetch(`/experiments/${id}/api`);
      const result: {
        totalImpressions: number;
        totalConversions: number;
        variantsResults: Record<string, VariantDetailsResults>;
      } = await response.json();

      if (!response.ok) {
        console.error("Failed to fetch experiment data:", result);
        return;
      }

      const variantsData = Object.keys(result.variantsResults).map((key) => {
        return {
          id: Number(key),
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

  const [data, setData] = useState<any[] | null>();

  useEffect(() => {
    setData(
      variantsData?.map((variant) => ({
        name: variants?.find((v) => v.id === variant?.id)?.name ?? "Unknown",
        "Conversion Rate":
          variant?.results?.totalImpressions &&
          variant?.results?.totalConversions
            ? (
                (variant?.results?.totalConversions /
                  variant?.results?.totalImpressions) *
                100
              ).toFixed(2)
            : 0,
      }))
    );
  }, [variantsData, variants]);

  const [combinedData, setCombinedData] = useState<
    | {
        id?: number;
        details?: SelectVariant;
        results?: VariantDetailsResults;
        percentage?: number;
      }[]
    | null
  >(null);

  useEffect(() => {
    if (!variantsData || !variants || !variantsPerExperiment) {
      return;
    }

    const combinedData = variantsData.map((variantData) => {
      const details = variants.find((v) => v.id === variantData.id);
      const percentage = variantsPerExperiment.find(
        (v) => v.variant_id === variantData.id
      )?.percentage;

      return {
        id: variantData.id,
        details,
        results: variantData.results,
        percentage: percentage,
      };
    });

    setCombinedData(combinedData);
  }, [variantsData, variants, variantsPerExperiment]);

  const colorPalette = [
    "hsl(240, 10%, 50%)", // Slate Gray
    "hsl(0, 0%, 41%)", // Dim Gray
    "hsl(120, 6%, 75%)", // Ash Gray
    "hsl(0, 0%, 83%)", // Light Gray
    "hsl(0, 0%, 25%)", // Charcoal Gray
  ];
  const colorPaletteConversions = [
    "hsl(270, 50%, 40%)", // Royal Purple
    "hsl(270, 100%, 90%)", // Lavender Mist
    "hsl(280, 60%, 70%)", // Orchid Purple
    "hsl(300, 30%, 40%)", // Plum
    "hsl(270, 50%, 60%)", // Amethyst
  ];

  const chartConfig =
    combinedData
      ?.flatMap((variantData, index) => {
        const colorImpressions = colorPalette[index % colorPalette.length];
        const colorConversions =
          colorPaletteConversions[index % colorPaletteConversions.length];

        return [
          {
            id: (variantData?.id ?? "NoVariant") + "_impressions",
            label: (variantData.details?.name ?? "No Variant") + " Impressions",
            color: colorImpressions,
          },
          {
            id: (variantData?.id ?? "NoVariant") + "_conversions",
            label: (variantData.details?.name ?? "No Variant") + " Conversions",
            color: colorConversions,
          },
        ];
      })
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

  type dailyData = {
    date: string;
    [key: string]: number | string;
  };
  // Join all variants per date
  const chartData = combinedData
    ?.flatMap((variant) => {
      // Flatten daily impressions
      const impressions =
        variant?.results?.dailyImpressions.map((imp) => ({
          date: imp.date,
          key: `${variant?.id ?? "NoVariant"}_impressions`,
          count: imp.count,
        })) ?? [];

      // Flatten daily conversions
      const conversions =
        variant?.results?.dailyConversions.map((conv) => ({
          date: conv.date,
          key: `${variant?.id ?? "NoVariant"}_conversions`,
          count: conv.count,
        })) ?? [];

      // Combine impressions + conversions for this variant
      return [...impressions, ...conversions];
    })
    ?.reduce((acc, row) => {
      const existing = acc.find((d) => d.date === row.date);
      if (existing) {
        existing[row.key] = Number(existing[row.key] ?? 0) + row.count;
      } else {
        acc.push({
          date: row.date,
          [row.key]: row.count,
        });
      }
      return acc;
    }, [] as dailyData[])
    .map((row) => {
      // Add lines in 0 if no data

      return {
        ...row,
        ...Object.keys(chartConfig).reduce((acc, key) => {
          if (!row[key]) {
            acc[key] = 0;
          }
          return acc;
        }, {} as Record<string, number>),
      };
    });

  console.log("config" ,chartConfig);
  console.log("data", chartData);

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
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsBarChart data={data ?? undefined}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Conversion Rate" fill="#8884d8" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Detailed Metrics</h3>
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
                    {combinedData?.map((variant) => (
                      <TableRow key={variant?.id}>
                        <TableCell className="font-medium">
                          {variant?.details?.name ?? "No Variant"}
                        </TableCell>
                        <TableCell>
                          {variant?.percentage
                            ? variant?.percentage.toFixed(2)
                            : "-"}
                          %
                        </TableCell>
                        <TableCell>
                          {variant?.results?.totalImpressions}
                        </TableCell>
                        <TableCell>
                          {variant.results?.totalConversions}
                        </TableCell>
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
              </div>
            </>
          ) : (
            <div className="mt-6">
              {!loadingVariants ? (
                <h3 className="text-lg mb-2">
                  No data available. Are you sure that the pixel is properly
                  integrated in the selected domains?
                </h3>
              ) : (
                <Skeleton className="h-64" />
              )}
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
                  <CartesianGrid />
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
                    // max={Math.max(
                    //   ...(chartData?.map((d: any) => d.impressions) ?? []),
                    //   ...(chartData?.map((d: any) => d.conversions) ?? [])
                    // )}
                  />

                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="line" />}
                  />
                  {Object.keys(chartConfig).map((key) => (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={key}
                      stroke={chartConfig[key].color}
                      strokeWidth={2}
                      dot={true}
                    />
                  ) as any)}
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        ))}
    </div>
  );
}
