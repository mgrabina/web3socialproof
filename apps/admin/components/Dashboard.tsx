"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useOnboarding } from "@/hooks/useOnboarding";
import { OnboardingName } from "@/lib/onboarding";
import { DollarSign, Eye, NotepadText, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import IntegrationGuide from "./IntegrationGuide";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "./ui/chart";

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(
    Boolean(localStorage.getItem(OnboardingName))
  );

  const onboarding = useOnboarding();

  useEffect(() => {
    if (!hasSeenOnboarding && !loading) {
      setHasSeenOnboarding(true);
      localStorage.setItem(OnboardingName, "true");
      onboarding?.start(OnboardingName);
    }
  }, [hasSeenOnboarding, onboarding, loading]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const response = await fetch("/dashboard/api");
      const result = await response.json();
      setData(result);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        {/* Top Rectangles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-24 rounded-md" />
          <Skeleton className="h-24 rounded-md" />
          <Skeleton className="h-24 rounded-md" />
          <Skeleton className="h-24 rounded-md" />
        </div>

        {/* Bottom Rectangle */}
        <Skeleton className="h-64 rounded-md" />
      </div>
    );
  }

  const {
    totalCampaigns,
    totalMetrics,
    totalImpressions,
    totalConversions,
    dailyImpressions,
    dailyConversions,
  } = data;

  type dailyData = {
    date: string;
    count?: number;
  };
  // Join daily impressions and conversions by date
  const chartData = dailyImpressions.map((impression: dailyData) => {
    const conversion = dailyConversions.find(
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
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-navy-900 to-navy-950">
      <div className="flex-1 p-8">
        {!!totalImpressions && totalImpressions > 0 ? (
          <div className="mx-auto max-w-6xl space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Dashboard</h1>
                {/* <p className="text-muted-foreground">Monitor your Web3 conversion metrics with Herd</p> */}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Total Campaigns</p>
                    <NotepadText className="h-4 w-4 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold">{totalCampaigns}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Total Metrics</p>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold">{totalMetrics}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Total Impressions</p>
                    <Eye className="h-4 w-4 text-blue-500" />
                  </div>
                  <p className="text-2xl font-bold">{totalImpressions}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Total Conversions</p>
                    <DollarSign className="h-4 w-4 text-blue-500" />
                  </div>
                  {totalConversions?.value ? (
                    <p className="text-2xl font-bold">
                      {totalConversions?.value}
                    </p>
                  ) : (
                    <Link
                      className="
                    text-blue-500 hover:text-blue-700
                    "
                      href="https://docs.gobyherd.com/campaigns/beta-conversions"
                      target="_blank"
                    >
                      Integrate
                    </Link>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Graph */}
            <Card>
              <CardContent className="pt-4">
                <h2 className="text-lg font-semibold">Daily Impressions</h2>

                <ChartContainer config={chartConfig}>
                  <AreaChart
                    data={chartData}
                    margin={{
                      left: 12,
                      right: 12,
                    }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tickFormatter={(value) => value.slice(0, 3)}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent indicator="line" />}
                    />
                    <Area
                      dataKey="desktop"
                      type="natural"
                      fill="var(--color-desktop)"
                      fillOpacity={0.4}
                      stroke="var(--color-desktop)"
                    />
                  </AreaChart>
                </ChartContainer>

                <ResponsiveContainer width="100%" height={300} className="pt-2">
                  <LineChart data={dailyImpressions}>
                    {/* <CartesianGrid strokeDasharray="3 3" /> */}
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                      isAnimationActive={true}
                      animationDuration={1500}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        ) : (
          <>
            <Card
              className="w-full mx-auto border border-gray-200 shadow-md mb-8"
              id="integration-guide"
            >
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
                    href="/campaigns/create"
                  >
                    campaign
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
