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
import { SelectCampaign, SelectMetric } from "@web3socialproof/db";
import {
  createNotification,
  defaultStyling,
  NotificationStylingOptional,
  NotificationStylingRequired,
} from "@web3socialproof/shared/constants/notification";
import { Skeleton } from "./ui/skeleton";

interface CampaignFormProps {
  initialData?: {
    name: string;
    type: string;
    message: string;
    sub_message: string;
    styling: any;
    hostnames?: string[] | null;
  };
  onSubmit: (data: any) => Promise<void>;
}

export default function CampaignForm({
  initialData = {
    name: "My Campaign",
    type: "swaps",
    message: "537 Swaps",
    sub_message: "4504 in the last month",
    styling: { ...defaultStyling },
    hostnames: [] as string[],
  },
  onSubmit,
}: CampaignFormProps) {
  const [formData, setFormData] = useState(initialData);
  const [metrics, setMetrics] = useState<SelectMetric[] | undefined>();
  const [availableMetricNames, setAvailableMetricNames] = useState(
    new Set<string>()
  );

  const handleHostnameAdd = () => {
    setFormData((prev: any) => ({
      ...prev,
      hostnames: [...prev.hostnames, ""],
    }));
  };

  const handleHostnameChange = (index: number, value: string) => {
    const updatedHostnames = [...(formData.hostnames ?? [])];
    updatedHostnames[index] = value;
    setFormData((prev: any) => ({
      ...prev,
      hostnames: updatedHostnames,
    }));
  };

  const handleHostnameRemove = (index: number) => {
    const updatedHostnames = formData.hostnames?.filter(
      (_: any, i: number) => i !== index
    );
    setFormData((prev: any) => ({
      ...prev,
      hostnames: updatedHostnames,
    }));
  };

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch("/metrics/api");
        const data = await response.json();
        setMetrics(data ?? []);
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
    setFormData((prev: any) => ({
      ...prev,
      styling: {
        ...(prev.styling as NotificationStylingRequired),
        [field]: value,
      },
    }));
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
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
              <Label htmlFor="message">Title</Label>
              <Input
                id="message"
                value={formData.message ?? ""}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sub_message">Subtitle</Label>
              <Input
                id="sub_message"
                value={formData.sub_message ?? ""}
                onChange={(e) =>
                  setFormData({ ...formData, sub_message: e.target.value })
                }
              />
            </div>

            <Accordion type="single" collapsible>
              <AccordionItem value="item-1">
                <AccordionTrigger>Advanced Customization</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    <Label htmlFor="fontFamily">Font Family</Label>
                    <Input
                      id="fontFamily"
                      value={formData.styling.fontFamily}
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
                      value={formData.styling.titleColor}
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
                      value={formData.styling.subtitleColor}
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
                      value={formData.styling.backgroundColor}
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
                      value={formData.styling.iconBackgroundColor}
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
                      value={formData.styling.iconColor}
                      onChange={(e) =>
                        handleStylingChange("iconColor", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="border">Border</Label>
                    <Input
                      id="border"
                      value={formData.styling.border}
                      onChange={(e) =>
                        handleStylingChange("border", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="borderRadius">Border Radius</Label>
                    <Input
                      id="borderRadius"
                      value={formData.styling.borderRadius}
                      onChange={(e) =>
                        handleStylingChange("borderRadius", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="boxShadow">Box Shadow</Label>
                    <Input
                      id="boxShadow"
                      value={formData.styling.boxShadow}
                      onChange={(e) =>
                        handleStylingChange("boxShadow", e.target.value)
                      }
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Allowed hostnames. Add as badges */}
            <div className="space-y-2">
              <Label>Allowed Hostnames</Label>
              <p className="text-sm text-gray-500">
                Specify hostnames where this campaign is allowed to run.
                Hostnames should not include protocols (e.g., use example.com
                instead of https://example.com).
              </p>

              {/* Existing Hostnames as Badges */}
              <div className="flex flex-wrap gap-2">
                {formData.hostnames?.map((hostname: string, index: number) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="flex items-center space-x-2 px-2 py-1"
                  >
                    <span>{hostname}</span>
                    <button
                      onClick={() => handleHostnameRemove(index)}
                      className="text-red-500 hover:text-red-700 focus:outline-none"
                    >
                      ✕
                    </button>
                  </Badge>
                ))}
              </div>

              {/* Input for Adding New Hostnames */}
              <div className="flex items-center space-x-2 mt-2">
                <Input
                  placeholder="Add a hostname (e.g., example.com)"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault(); // Prevent form submission
                      const value = (e.target as HTMLInputElement).value.trim();
                      if (value) {
                        setFormData((prev) => ({
                          ...prev,
                          hostnames: [...(prev.hostnames ?? []), value],
                        }));
                        (e.target as HTMLInputElement).value = ""; // Clear input field
                      } else {
                        toast({
                          title: "Invalid Hostname",
                          description: "Please enter a valid hostname.",
                          variant: "destructive",
                        });
                      }
                    }
                  }}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const input = document.querySelector<HTMLInputElement>(
                      'input[placeholder="Add a hostname (e.g., example.com)"]'
                    );
                    if (input) {
                      const value = input.value.trim();
                      if (value) {
                        setFormData((prev) => ({
                          ...prev,
                          hostnames: [...(prev.hostnames ?? []), value],
                        }));
                        input.value = ""; // Clear input field
                      } else {
                        toast({
                          title: "Invalid Hostname",
                          description: "Please enter a valid hostname.",
                          variant: "destructive",
                        });
                      }
                    }
                  }}
                >
                  Add
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Available Metrics</Label>
              <br />
              <Label className="text-sm text-gray-500">
                You can add them like this `{"{METRIC}"}` in the title or
                subtitle.
              </Label>
              <div className="space-y-2">
                {!metrics ? (
                  <Skeleton
                    className="
                      w-full
                      h-8
                      rounded-md
                      bg-gray-200
                      animate-pulse
                "
                  />
                ) : (
                  metrics.map((metric) => (
                    <Badge key={metric.id} variant="outline">
                      {metric.name}
                    </Badge>
                  ))
                )}
              </div>
            </div>
            <Button className="w-full" onClick={() => onSubmit(formData)}>
              Save Campaign
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
                    message: formData.message ?? "",
                    subMessage: formData.sub_message ?? "",
                    styling: formData.styling as NotificationStylingRequired,
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
