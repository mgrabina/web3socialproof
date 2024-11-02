"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  BarChart,
  Wallet,
  ArrowUpRight,
  Users,
  Settings,
  LogOut,
  Bell,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";

export default function Dashboard() {
  return (
    <div className="flex min-h-screen bg-gradient-to-b from-navy-900 to-navy-950">
      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="mx-auto max-w-6xl space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">
                Monitor your Web3 conversion metrics with Talaria
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Total Conversions</p>
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                </div>
                <p className="text-2xl font-bold">2,543</p>
                <p className="text-xs text-muted-foreground">
                  +15.8% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Talaria Increment</p>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
                <p className="text-2xl font-bold">+32%</p>
                <p className="text-xs text-muted-foreground">
                  Improvement vs. not using Talaria
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Total Wallets</p>
                  <Wallet className="h-4 w-4 text-blue-500" />
                </div>
                <p className="text-2xl font-bold">12,789</p>
                <p className="text-xs text-muted-foreground">
                  +1,234 new this month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Notifications Sent</p>
                  <Bell className="h-4 w-4 text-yellow-500" />
                </div>
                <p className="text-2xl font-bold">45,678</p>
                <p className="text-xs text-muted-foreground">
                  98.7% delivery rate
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
