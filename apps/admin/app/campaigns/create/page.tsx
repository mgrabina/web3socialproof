"use client";

import React, { useEffect, useState } from "react";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { SelectMetric } from "@web3socialproof/db";
import {
  createNotification,
  defaultStyling,
} from "@web3socialproof/shared/constants/notification";
import { Flame } from "lucide-react";

export default function CampaignCreation() {
  const [formData, setFormData] = useState({
    name: "My Campaign",
    type: "swaps",
    mainText: "537 Swaps",
    subText: "4504 in the last month",
  });
  const router = useRouter();

  const [metrics, setMetrics] = useState<SelectMetric[]>([]);
  const [availableMetricNames, setAvailableMetricNames] = useState(
    new Set<string>()
  );

  // State for advanced styling options
  const [stylingOptions, setStylingOptions] = useState({
    ...defaultStyling,
  });

  // Fetch available metrics from API
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch("/metrics/api");
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

  const handleStylingChange = (field: string, value: string) => {
    setStylingOptions((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCreateCampaign = async () => {
    try {
      const creationResponse = await fetch("/campaigns/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, styling: stylingOptions }),
      });
      if (creationResponse.ok) {
        router.push("/campaigns");
      } else {
        throw new Error("Failed to create campaign.");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create campaign.",
        variant: "destructive",
      });
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
              <Label htmlFor="mainText">Title</Label>
              <Input
                id="mainText"
                value={formData.mainText}
                onChange={(e) =>
                  setFormData({ ...formData, mainText: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subText">Subtitle</Label>
              <Input
                id="subText"
                value={formData.subText}
                onChange={(e) =>
                  setFormData({ ...formData, subText: e.target.value })
                }
              />
            </div>

            {/* <Button onClick={() => setIsAdvancedOptionsVisible(!isAdvancedOptionsVisible)}>
              {isAdvancedOptionsVisible ? "Hide" : "Show"} Advanced Options
            </Button> */}

            <Accordion type="single" collapsible>
              <AccordionItem value="item-1">
                <AccordionTrigger>Advanced Customization</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    <Label htmlFor="fontFamily">Font Family</Label>
                    <Input
                      id="fontFamily"
                      value={stylingOptions.fontFamily}
                      onChange={(e) =>
                        handleStylingChange("fontFamily", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="titleColor">Title Color</Label>
                    <Input
                      id="titleColor"
                      type="color"
                      value={stylingOptions.titleColor}
                      onChange={(e) =>
                        handleStylingChange("titleColor", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subtitleColor">Subtitle Color</Label>
                    <Input
                      id="subtitleColor"
                      type="color"
                      value={stylingOptions.subtitleColor}
                      onChange={(e) =>
                        handleStylingChange("subtitleColor", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="backgroundColor">Background Color</Label>
                    <Input
                      id="backgroundColor"
                      type="color"
                      value={stylingOptions.backgroundColor}
                      onChange={(e) =>
                        handleStylingChange("backgroundColor", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="iconBackgroundColor">
                      Icon Background Color
                    </Label>
                    <Input
                      id="iconBackgroundColor"
                      type="color"
                      value={stylingOptions.iconBackgroundColor}
                      onChange={(e) =>
                        handleStylingChange(
                          "iconBackgroundColor",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="iconColor">Icon Color</Label>
                    <Input
                      id="iconColor"
                      type="color"
                      value={stylingOptions.iconColor}
                      onChange={(e) =>
                        handleStylingChange("iconColor", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="border">Border</Label>
                    <Input
                      id="border"
                      value={stylingOptions.border}
                      onChange={(e) =>
                        handleStylingChange("border", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="borderRadius">Border Radius</Label>
                    <Input
                      id="borderRadius"
                      value={stylingOptions.borderRadius}
                      onChange={(e) =>
                        handleStylingChange("borderRadius", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="boxShadow">Box Shadow</Label>
                    <Input
                      id="boxShadow"
                      value={stylingOptions.boxShadow}
                      onChange={(e) =>
                        handleStylingChange("boxShadow", e.target.value)
                      }
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="space-y-2">
              <Label>Available Metrics</Label>
              <br />
              <Label className="text-sm text-gray-500">
                You can add them like this `{"{METRIC}"}` in the title or
                subtitle.
              </Label>
              <div className="space-y-2">
                {metrics.map((metric) => (
                  <Badge
                    key={metric.id}
                    variant="outline"
                    className="
                    secondary
                  "
                  >
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

        <Card className="border-none shadow-none">
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              dangerouslySetInnerHTML={{
                __html: createNotification(
                  {
                    campaign: 0,
                    type: "swaps",
                    icon: "https://static.thenounproject.com/png/1878140-200.png",
                    verificationLink: "https://example.com",
                    message: formData.mainText,
                    subMessage: formData.subText,
                    styling: stylingOptions,
                  },
                  true,
                  availableMetricNames
                ).innerHTML,
              }}
            ></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
