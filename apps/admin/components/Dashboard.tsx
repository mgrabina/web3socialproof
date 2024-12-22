"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useUserContext } from "@/lib/context/useUserContext";
import { OnboardingName } from "@/lib/onboarding";
import { createSupabaseClientForClientSide } from "@/utils/supabase/client";
import { DollarSign, Eye, NotepadText, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import IntegrationGuide from "./IntegrationGuide";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "./ui/chart";

export default function Dashboard() {
  const [data, setData] = useState<{
    dailyImpressions: { date: string; count: number }[];
    dailyConversions: { date: string; count: number }[];
  } | null>();
  const [dailyInfoLoading, setDailyInfoLoading] = useState(true);

  const supabase = createSupabaseClientForClientSide();
  const { user, protocol } = useUserContext();

  const [totalExperiments, setTotalExperiments] = useState<number | null>();
  const [totalExperimentsLoading, setTotalExperimentsLoading] = useState(true);
  const [totalMetrics, setTotalMetrics] = useState<number | null>();
  const [totalMetricsLoading, setTotalMetricsLoading] = useState(true);
  const [totalImpressions, setTotalImpressions] = useState<number | null>();
  const [totalImpressionsLoading, setTotalImpressionsLoading] = useState(true);
  const [totalConversionsWithHerd, setTotalConversionsWithHerd] = useState<
    number | null
  >();
  const [totalConversionsWithHerdLoading, setTotalConversionsWithHerdLoading] =
    useState(true);
  const [totalConversionsWithoutHerd, setTotalConversionsWithoutHerd] =
    useState<number | null>();
  const [
    totalConversionsWithoutHerdLoading,
    setTotalConversionsWithoutHerdLoading,
  ] = useState(true);

  const [anythingLoading, setAnythingLoading] = useState(
    totalExperimentsLoading ||
      totalMetricsLoading ||
      totalImpressionsLoading ||
      totalConversionsWithHerdLoading ||
      totalConversionsWithoutHerdLoading
  );

  useEffect(() => {
    if (!protocol?.id) {
      return;
    }

    Promise.all([
      supabase
        .from("experiments_table")
        .select("*", { count: "exact", head: true })
        .eq("protocol_id", protocol?.id)
        .eq("enabled", true)
        .then((data) => {
          setTotalExperiments(data.count);
          setTotalExperimentsLoading(false);
        }),

      supabase
        .from("metrics_table")
        .select("*", { count: "exact", head: true })
        .eq("protocol_id", protocol?.id)
        .eq("enabled", true)
        .then((data) => {
          setTotalMetrics(data.count);
          setTotalMetricsLoading(false);
        }),

      supabase
        .from("impressions_table")
        .select("*", { count: "exact", head: true })
        .eq("protocol_id", protocol?.id)
        .then((data) => {
          setTotalImpressions(data.count);
          setTotalImpressionsLoading(false);
        }),

      supabase
        .from("conversions_table")
        .select("*", { count: "exact", head: true })
        .eq("protocol_id", protocol?.id)
        .not("variant_id", "is", null)
        .then((data) => {
          setTotalConversionsWithHerd(data.count);
          setTotalConversionsWithHerdLoading(false);
        }),

      supabase
        .from("conversions_table")
        .select("*", { count: "exact", head: true })
        .eq("protocol_id", protocol?.id)
        .is("variant_id", null)
        .then((data) => {
          setTotalConversionsWithoutHerd(data.count);
          setTotalConversionsWithoutHerdLoading(false);
        }),
    ]);
  }, [protocol, supabase]);

  const hasIntegrated =
    !totalImpressionsLoading && totalImpressions && totalImpressions > 0;

  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(
    Boolean(localStorage.getItem(OnboardingName))
  );

  const onboarding = useOnboarding();

  useEffect(() => {
    if (!hasSeenOnboarding && !totalImpressionsLoading) {
      setHasSeenOnboarding(true);
      localStorage.setItem(OnboardingName, "true");
      onboarding?.start(OnboardingName);
    }
  }, [hasSeenOnboarding, onboarding, totalImpressionsLoading]);

  // useEffect(() => {
  //   if (hasSeenOnboarding !== true && !hasIntegrated) {
  //     onboarding?.start(OnboardingName);

  //     setTimeout(() => {
  //       setHasSeenOnboarding(true);
  //     }, 3000);
  //   }
  // }, [
  //   hasSeenOnboarding,
  //   setHasSeenOnboarding,
  //   onboarding,
  //   anythingLoading,
  //   hasIntegrated,
  // ]);

  useEffect(() => {
    async function fetchData() {
      setDailyInfoLoading(true);
      const response = await fetch("/dashboard/api");
      const result = await response.json();
      setData(result);
      setDailyInfoLoading(false);
    }
    fetchData();
  }, []);

  const { dailyImpressions, dailyConversions } = data ?? {};

  type dailyData = {
    date: string;
    count?: number;
  };
  // Join daily impressions and conversions by date
  const chartData = dailyImpressions?.map((impression: dailyData) => {
    const conversion = dailyConversions?.find(
      (conversion: dailyData) => conversion.date === impression.date
    );
    return {
      date: impression.date,
      impressions: impression.count,
      conversions: conversion?.count,
    };
  });

  const chartConfig = {
    impressions: {
      label: "Impressions",
      color: "hsl(var(--chart-1))",
    },
    conversions: {
      label: "Conversions",
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig;

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-navy-900 to-navy-950">
      <div className="flex-1 p-8">
        {hasIntegrated ? (
          <div className="mx-auto max-w-6xl space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground">
                  Welcome back, {user?.name ?? "User"}! Here is a quick overview
                  of your experiments and metrics.
                </p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Active Experiments</p>
                    <NotepadText className="h-4 w-4 text-green-500" />
                  </div>
                  {totalExperimentsLoading && <Skeleton className="h-6 w-12" />}
                  <p className="text-2xl font-bold">{totalExperiments}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Metrics Indexing</p>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  </div>
                  {totalMetricsLoading && <Skeleton className="h-6 w-12" />}
                  <p className="text-2xl font-bold">{totalMetrics}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Impressions</p>
                    <Eye className="h-4 w-4 text-blue-500" />
                  </div>
                  {totalImpressionsLoading && <Skeleton className="h-6 w-12" />}
                  <p className="text-2xl font-bold">{totalImpressions}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Lift</p>
                    <DollarSign className="h-4 w-4 text-blue-500" />
                  </div>
                  {totalConversionsWithHerdLoading ||
                    (totalConversionsWithoutHerdLoading && (
                      <Skeleton className="h-6 w-12" />
                    ))}

                  {totalConversionsWithHerd && totalConversionsWithoutHerd ? (
                    <p className="text-2xl font-bold">
                      {totalConversionsWithoutHerd !== 0
                        ? (
                            ((totalConversionsWithHerd -
                              totalConversionsWithoutHerd) /
                              totalConversionsWithoutHerd) *
                            100
                          ).toFixed(2)
                        : "∞" + "%"}
                    </p>
                  ) : (
                    <Link
                      className="
                    text-blue-500 hover:text-blue-700
                    "
                      href="https://docs.gobyherd.com/variants/beta-conversions"
                      target="_blank"
                    >
                      Integrate
                    </Link>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Graph */}
            {dailyInfoLoading ? (
              <Skeleton className="h-64" />
            ) : (
              <Card>
                <CardContent className="pt-4">
                  <h2 className="text-lg font-semibold">Daily Performance</h2>
                  <label className="text-muted-foreground">
                    Impressions and Conversions
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
            )}
          </div>
        ) : (
          <>
            <Card className="w-full mx-auto border border-gray-200 shadow-md mb-8">
              <CardHeader className="border-b border-gray-200 p-4 bg-gray-50">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl font-semibold text-gray-800">
                    Welcome to Herd!
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-lg font-semibold">
                  You are one step closer to lift your conversions 🎉
                </p>
                <p className="text-muted-foreground">
                  You can start by integrating the script using the guide below
                  or our{" "}
                  <a
                    className="text-blue-500 hover:text-blue-700"
                    target="_blank"
                    href="https://docs.gobyherd.com/getting-started/integration"
                  >
                    documentation
                  </a>{" "}
                  for advanced integrations, or just creating your first{" "}
                  <a
                    target="_blank"
                    className="text-blue-500 hover:text-blue-700"
                    href="/metrics/create"
                  >
                    metric
                  </a>{" "}
                  and{" "}
                  <a
                    target="_blank"
                    className="text-blue-500 hover:text-blue-700"
                    href="/variants/create"
                  >
                    variant
                  </a>{" "}
                  to be executed once the script is integrated.
                </p>
                <p
                  className="text-muted-foreground"
                  style={{ marginTop: "1rem" }}
                >
                  In case you want to see the onboarding again, please click{" "}
                  <label
                    className="text-blue-500 cursor-pointer hover:text-blue-700"
                    onClick={() => onboarding.start(OnboardingName)}
                  >
                    here
                  </label>
                </p>
              </CardContent>
            </Card>

            <IntegrationGuide />
          </>
        )}
      </div>
    </div>
  );
}
