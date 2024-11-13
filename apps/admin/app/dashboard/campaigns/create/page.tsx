"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation"; // To navigate back to the manager page
import { Flame, Users, Wallet, BadgeCheck, ShieldCheck } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { SelectMetric } from "@web3socialproof/db";

export default function CampaignCreation() {
  const [formData, setFormData] = useState({
    name: "My Campaign",
    type: "swaps",
    mainText: "537 Swaps",
    subText: "4504 in the last month",
  });
  const router = useRouter(); // To handle navigation after creation

  const [metrics, setMetrics] = useState<SelectMetric[]>([]);
  const [availableMetricNames, setAvailableMetricNames] = useState(new Set());

  // Fetch available metrics from API
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch("/dashboard/metrics/api");
        const data = await response.json();
        setMetrics(data);
        setAvailableMetricNames(
          new Set(data.map((metric: SelectMetric) => metric.name))
        );
      } catch (error) {
        console.error("Error fetching metrics:", error);
      }
    };
    fetchMetrics();
  }, []);

  // Function to style {{METRIC}} placeholders
  const renderTextWithMetricStyles = (text: string) => {
    const regex = /{(.*?)}/g;
    return text.split(regex).map((part, index) => {
      if (index % 2 === 1) {
        const isValidMetric = availableMetricNames.has(part);
        return (
          <span
            key={index}
            style={{
              color: isValidMetric ? "#9EDF9C" : "#FA7070",
              fontWeight: "bold",
            }}
          >
            {`{${part}}`}
          </span>
        );
      }
      return part;
    });
  };

  const notificationTypes = [
    { value: "swaps", label: "Swaps", icon: Flame },
    { value: "wallets", label: "Wallets Connected", icon: Wallet },
    { value: "tvl", label: "TVL", icon: Users },
    { value: "audits", label: "Audits", icon: ShieldCheck },
  ];

  const handleCreateCampaign = async () => {
    try {
      const creationResponse = fetch("/dashboard/campaigns/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
        .then((res) => {
          router.push("/dashboard/campaigns"); // Redirect to Campaign Manager
        })
        .catch((err) => {
          toast({
            title: "Error",
            description: "Failed to create campaign.",
            variant: "destructive",
          });
          return;
        });
    } catch (error) {
      console.error("Error creating campaign:", error);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Create Campaign</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Campaign Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="My Campaign"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="mainText"
                placeholder=""
                value={formData.mainText}
                onChange={(e) =>
                  setFormData({ ...formData, mainText: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Subtitle</Label>
              <Input
                id="subText"
                placeholder=""
                value={formData.subText}
                onChange={(e) =>
                  setFormData({ ...formData, subText: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Notification Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {notificationTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <type.icon className="h-4 w-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Available Metrics</Label>
              <br />
              <Label className="text-sm text-gray-500">
                You can add them like this `{"{METRIC}"}` in the title or
                subtitle.
              </Label>
              <div className="space-y-2">
                {metrics.map((metric) => (
                  <Badge key={metric.id} variant="outline" className="
                    secondary
                  ">
                    {metric.name}
                  </Badge>
                ))}
              </div>
            </div>

            <Button className="w-full" onClick={handleCreateCampaign}>
              Create Campaign
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-white rounded-full shadow-lg p-4">
              <div className="flex items-center gap-4">
                <div
                  className={`rounded-full p-4 ${
                    formData.type === "swaps"
                      ? "bg-red-50"
                      : formData.type === "wallets"
                      ? "bg-blue-50"
                      : formData.type === "tvl"
                      ? "bg-green-50"
                      : "bg-purple-50"
                  }`}
                >
                  <Flame className="h-6 w-6 text-red-500" />
                </div>
                <div className="flex-1">
                  <div className="text-xl font-semibold">
                    {renderTextWithMetricStyles(formData.mainText)}
                  </div>
                  <div className="text-gray-500">{renderTextWithMetricStyles(formData.subText)}</div>
                  <div className="flex items-center gap-1 mt-1 text-blue-500">
                    <BadgeCheck className="h-4 w-4" />
                    <span className="text-sm">
                      Verified on-chain by Talaria
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
