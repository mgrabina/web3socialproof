"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { capitalize, capitalizeEachWord } from "@/utils/strings/string.utils";
import { InsertCampaign, SelectMetric } from "@web3socialproof/db";
import {
  createNotification,
  defaultStyling,
  DestkopPositions,
  IconName,
  iconNames,
  iconsSvgs,
  MobilePositions,
  NotificationStylingRequired,
} from "@web3socialproof/shared/constants/notification";
import parse from "html-react-parser";
import { useEffect, useState } from "react";
import { Skeleton } from "./ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface CampaignFormProps {
  initialData?: {
    name?: string;
    type: string;
    message?: string;
    sub_message?: string;
    styling: any;
    iconSrc?: string | null;
    iconName?: string | null;
    delay?: number | null;
    timer?: number | null;
    hostnames?: string[] | null;
    pathnames?: string[] | null;
  };
  onSubmit: (data: any) => Promise<void>;
}

export default function CampaignForm({
  initialData = {
    type: "swaps",
    iconName: "flame",
    styling: { ...defaultStyling },
    hostnames: [] as string[],
    pathnames: [] as string[],
  },
  onSubmit,
}: CampaignFormProps) {
  const [formData, setFormData] =
    useState<
      Partial<
        (InsertCampaign & { styling: NotificationStylingRequired }) | undefined
      >
    >();
  const [metrics, setMetrics] = useState<SelectMetric[] | undefined>();
  const [availableMetricNames, setAvailableMetricNames] = useState(
    new Set<string>()
  );

  useEffect(() => {
    if (initialData && (!formData || !formData.styling))
      setFormData(initialData);
  }, [initialData, formData]);

  const handlePathnameAdd = () => {
    setFormData((prev: any) => ({
      ...prev,
      pathnames: [...(prev.pathnames ?? []), ""],
    }));
  };

  const handlePathnameChange = (index: number, value: string) => {
    const updatedPathnames = [...(formData?.pathnames ?? [])];
    updatedPathnames[index] = value;
    setFormData((prev: any) => ({
      ...prev,
      pathnames: updatedPathnames,
    }));
  };

  const handlePathnameRemove = (index: number) => {
    const updatedPathnames = formData?.pathnames?.filter(
      (_: any, i: number) => i !== index
    );
    setFormData((prev: any) => ({
      ...prev,
      pathnames: updatedPathnames,
    }));
  };

  const isValidRegex = (value: string): boolean => {
    if (value.startsWith("^") && value.endsWith("$")) {
      try {
        new RegExp(value);
        return true;
      } catch (e) {
        return false;
      }
    }
    return true; // Non-regex inputs are always valid
  };

  const handleHostnameAdd = () => {
    setFormData((prev: any) => ({
      ...prev,
      hostnames: [...prev.hostnames, ""],
    }));
  };

  const handleHostnameChange = (index: number, value: string) => {
    const updatedHostnames = [...(formData?.hostnames ?? [])];
    updatedHostnames[index] = value;
    setFormData((prev: any) => ({
      ...prev,
      hostnames: updatedHostnames,
    }));
  };

  const handleHostnameRemove = (index: number) => {
    const updatedHostnames = formData?.hostnames?.filter(
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

  const [isLoading, setIsLoading] = useState(false);

  const [isMobilePreview, setIsMobilePreview] = useState(false);
  const [isVerifiedPreview, setIsVerifiedPreview] = useState(false);

  const handleStylingChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      styling: {
        ...(prev.styling as NotificationStylingRequired),
        [field]: value,
      },
    }));
  };

  return (
    <div className="container mx-auto p-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Campaign Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 overflow-y-scroll max-h-[750px]">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="A unique name to easily identify your campaign"
                value={formData?.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Title</Label>
              <Input
                id="message"
                placeholder="{METRIC} staked in Protocol!"
                value={formData?.message ?? ""}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sub_message">Subtitle</Label>
              <Input
                id="sub_message"
                placeholder="Join the community and start earning rewards!"
                value={formData?.sub_message ?? ""}
                onChange={(e) =>
                  setFormData({ ...formData, sub_message: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Available Metrics</Label>
              <br />
              {!metrics?.length ? (
                <Label className="text-sm text-gray-500">
                  There are not any metrics set, you can add them{" "}
                  <a
                    href="/metrics"
                    target="_blank"
                    className="
                    text-blue-500
                    hover:text-blue-800
                    focus:outline-none
                  "
                  >
                    here
                  </a>
                  .
                </Label>
              ) : (
                <Label className="text-sm text-gray-500">
                  You can add them like this `{"{METRIC}"}` in the title or
                  subtitle.
                </Label>
              )}
              <div className="space-y-2">
                {!metrics?.length ? (
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
                  metrics?.map((metric) => (
                    <Badge key={metric.id} variant="outline">
                      {metric.name}
                    </Badge>
                  ))
                )}
              </div>
            </div>

            <Accordion type="single" collapsible>
              <AccordionItem value="item-1">
                <AccordionTrigger>Overall Styling</AccordionTrigger>
                <AccordionContent className="p-2">
                  <div className="space-y-2">
                    <Label>Desktop Position</Label>
                    <Select
                      value={formData?.styling?.desktopPosition.toString()}
                      onValueChange={(value) =>
                        handleStylingChange("desktopPosition", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Desktop Position" />
                      </SelectTrigger>
                      <SelectContent>
                        {DestkopPositions.map((position) => (
                          <SelectItem
                            key={position}
                            value={position.toString()}
                          >
                            {capitalizeEachWord(position.replace("-", " "))}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <br />
                  <div className="space-y-2">
                    <Label>Mobile Position</Label>
                    <Select
                      value={formData?.styling?.mobilePosition.toString()}
                      onValueChange={(value) =>
                        handleStylingChange("mobilePosition", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Mobile Position" />
                      </SelectTrigger>
                      <SelectContent>
                        {MobilePositions.map((position) => (
                          <SelectItem
                            key={position}
                            value={position.toString()}
                          >
                            {capitalizeEachWord(position.replace("-", " "))}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <label className="text-sm text-gray-500">
                      Select None to disable the notification on mobile
                    </label>
                  </div>
                  <br />
                  <div className="space-y-2">
                    <Label htmlFor="fontFamily">Font Family</Label>
                    <Input
                      id="fontFamily"
                      value={formData?.styling?.fontFamily}
                      onChange={(e) =>
                        handleStylingChange("fontFamily", e.target.value)
                      }
                    />
                  </div>
                  <br />
                  <div className="space-y-2">
                    <Label htmlFor="titleColor">Title Color</Label>
                    <Input
                      id="titleColor"
                      type="color"
                      value={formData?.styling?.titleColor}
                      onChange={(e) =>
                        handleStylingChange("titleColor", e.target.value)
                      }
                    />
                  </div>
                  <br />
                  <div className="space-y-2">
                    <Label htmlFor="subtitleColor">Subtitle Color</Label>
                    <Input
                      id="subtitleColor"
                      type="color"
                      value={formData?.styling?.subtitleColor}
                      onChange={(e) =>
                        handleStylingChange("subtitleColor", e.target.value)
                      }
                    />
                  </div>
                  <br />
                  <div className="space-y-2">
                    <Label htmlFor="backgroundColor">Background Color</Label>
                    <Input
                      id="backgroundColor"
                      type="color"
                      value={formData?.styling?.backgroundColor}
                      onChange={(e) =>
                        handleStylingChange("backgroundColor", e.target.value)
                      }
                    />
                  </div>
                  <br />
                  <div className="space-y-2">
                    <Label htmlFor="border">Border</Label>
                    <Input
                      id="border"
                      value={formData?.styling?.border}
                      onChange={(e) =>
                        handleStylingChange("border", e.target.value)
                      }
                    />
                  </div>
                  <br />
                  <div className="space-y-2">
                    <Label htmlFor="borderRadius">Border Radius</Label>
                    <Input
                      id="borderRadius"
                      value={formData?.styling?.borderRadius}
                      onChange={(e) =>
                        handleStylingChange("borderRadius", e.target.value)
                      }
                    />
                  </div>
                  <br />
                  <div className="space-y-2">
                    <Label htmlFor="boxShadow">Box Shadow</Label>
                    <Input
                      id="boxShadow"
                      value={formData?.styling?.boxShadow}
                      onChange={(e) =>
                        handleStylingChange("boxShadow", e.target.value)
                      }
                    />
                  </div>
                  <br />
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Icon Styling</AccordionTrigger>
                <AccordionContent className="p-2">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={formData?.styling?.showIcon}
                          onCheckedChange={(checked) =>
                            handleStylingChange("showIcon", Boolean(checked))
                          }
                        />

                        <Label htmlFor="airplane-mode">Show Icon</Label>
                      </div>
                    </div>
                  </div>
                  <br />

                  <Tabs defaultValue="predefined">
                    <TabsList>
                      <TabsTrigger value="predefined">Predefined</TabsTrigger>
                      <TabsTrigger value="custom">Custom</TabsTrigger>
                    </TabsList>

                    <TabsContent value="predefined">
                      <Label>Predefined Icons</Label>
                      <Select
                        value={formData?.iconName?.toString() || undefined}
                        onValueChange={(value) => {
                          setFormData((prev) => ({ ...prev, iconName: value }));
                          setFormData((prev) => ({
                            ...prev,
                            iconSrc: undefined,
                          }));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Icon" />
                        </SelectTrigger>
                        <SelectContent>
                          {iconNames.map((iconName) => (
                            <SelectItem key={iconName} value={iconName}>
                              {capitalize(iconName)}
                              {parse(iconsSvgs[iconName]()?.getHTML() ?? "")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TabsContent>

                    <TabsContent value="custom">
                      <Label>Custom Icon</Label>
                      <Input
                        placeholder="Custom Icon Field"
                        value={formData?.iconSrc ?? undefined}
                        onChange={(e) => {
                          const value = e.target.value;
                          setFormData((prev) => ({
                            ...prev,
                            iconSrc: value,
                          }));
                          setFormData((prev) => ({
                            ...prev,
                            iconName: undefined,
                          }));
                        }}
                      />
                    </TabsContent>
                  </Tabs>
                  <br />
                  <div className="space-y-2">
                    <Label htmlFor="iconBackgroundColor">
                      Icon Background Color
                    </Label>
                    <Input
                      id="iconBackgroundColor"
                      type="color"
                      value={formData?.styling?.iconBackgroundColor}
                      onChange={(e) =>
                        handleStylingChange(
                          "iconBackgroundColor",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <br />
                  <div className="space-y-2">
                    <Label htmlFor="iconColor">Icon Color</Label>
                    <Input
                      id="iconColor"
                      type="color"
                      value={formData?.styling?.iconColor}
                      onChange={(e) =>
                        handleStylingChange("iconColor", e.target.value)
                      }
                    />
                  </div>
                  <br />
                  <div className="space-y-2">
                    <Label htmlFor="borderRadius">Container Radius</Label>
                    <Input
                      id="borderRadius"
                      value={formData?.styling?.iconBorderRadius}
                      onChange={(e) =>
                        handleStylingChange("iconBorderRadius", e.target.value)
                      }
                    />
                  </div>
                  <br />
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Where to show it</AccordionTrigger>
                <AccordionContent className="p-2">
                  {/* Allowed hostnames. Add as badges */}
                  <div className="space-y-2">
                    <Label>Allowed Domains</Label>
                    <p className="text-sm text-gray-500">
                      Specify domains where this campaign is allowed to run.
                      Domains should not include protocols (e.g., use
                      example.com instead of https://example.com).
                    </p>

                    {/* Existing Hostnames as Badges */}
                    <div className="flex flex-wrap gap-2">
                      {formData?.hostnames?.map(
                        (hostname: string, index: number) => (
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
                        )
                      )}
                    </div>

                    {/* Input for Adding New Hostnames */}
                    <div className="flex items-center space-x-2 mt-2">
                      <Input
                        placeholder="Add a domain (e.g., example.com)"
                        id="domain-input"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault(); // Prevent form submission
                            const value = (
                              e.target as HTMLInputElement
                            ).value.trim();
                            if (value) {
                              setFormData((prev) => ({
                                ...prev,
                                hostnames: [...(prev?.hostnames ?? []), value],
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
                          const input = document.getElementById(
                            "domain-input"
                          ) as HTMLInputElement;
                          if (input) {
                            const value = input.value.trim();
                            if (value) {
                              setFormData((prev) => ({
                                ...prev,
                                hostnames: [...(prev?.hostnames ?? []), value],
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
                  <br />

                  {/* Pathnames */}
                  <div className="space-y-2">
                    <Label>Allowed Pages</Label>
                    <p className="text-sm text-gray-500">
                      Specify on which pages this campaign is allowed to run.
                      You can use regex for advanced matching (e.g.,{" "}
                      <code>^/metrics$</code>). By default, all pages are
                      allowed.
                    </p>

                    {/* Existing Pathnames as Badges */}
                    <div className="flex flex-wrap gap-2">
                      {formData?.pathnames?.map(
                        (pathname: string, index: number) => {
                          const isValid = isValidRegex(pathname);
                          return (
                            <Badge
                              key={index}
                              variant="outline"
                              className="flex items-center space-x-2 px-2 py-1"
                              title={!isValid ? "Invalid regex pattern" : ""}
                            >
                              <span
                                className={`${!isValid ? "text-red-500" : ""}`}
                              >
                                {pathname}
                              </span>
                              <button
                                onClick={() => handlePathnameRemove(index)}
                                className="text-red-500 hover:text-red-700 focus:outline-none"
                              >
                                ✕
                              </button>
                            </Badge>
                          );
                        }
                      )}
                    </div>

                    {/* Input for Adding New Pathnames */}
                    <div className="flex items-center space-x-2 mt-2">
                      <Input
                        placeholder="Add a pathname or regex (e.g., ^/metrics$)"
                        id="pathname-input"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault(); // Prevent form submission
                            const value = (
                              e.target as HTMLInputElement
                            ).value.trim();
                            // const isRegex =
                            //   value.startsWith("^") && value.endsWith("$");
                            // const isValid = isRegex ? isValidRegex(value) : true;

                            // if (!isValid) {
                            //   toast({
                            //     title: "Invalid Regex",
                            //     description: "Please enter a valid regex pattern.",
                            //     variant: "destructive",
                            //   });
                            //   return;
                            // }

                            if (value) {
                              setFormData((prev) => ({
                                ...prev,
                                pathnames: [...(prev?.pathnames ?? []), value],
                              }));
                              (e.target as HTMLInputElement).value = ""; // Clear input field
                            }
                          }
                        }}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const input = document.getElementById(
                            "pathname-input"
                          ) as HTMLInputElement;
                          if (input) {
                            const value = input.value.trim();
                            // const isRegex =
                            //   value.startsWith("^") && value.endsWith("$");
                            // const isValid = isRegex ? isValidRegex(value) : true;

                            // if (!isValid) {
                            //   toast({
                            //     title: "Invalid Regex",
                            //     description: "Please enter a valid regex pattern.",
                            //     variant: "destructive",
                            //   });
                            //   return;
                            // }

                            if (value) {
                              setFormData((prev) => ({
                                ...prev,
                                pathnames: [...(prev?.pathnames ?? []), value],
                              }));
                              input.value = ""; // Clear input field
                            }
                          }
                        }}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                  <br />
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger>When to show it</AccordionTrigger>
                <AccordionContent className="p-2">
                  <div className="space-y-2">
                    <Label htmlFor="delay">Delay</Label>
                    <br />
                    <label className="text-sm text-gray-500">
                      In milliseconds, before showing the notification
                    </label>
                    <Input
                      id="delay"
                      value={formData?.delay ?? 1500}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          delay: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <br />
                  <div className="space-y-2">
                    <Label htmlFor="delay">Timer</Label>
                    <br />
                    <label className="text-sm text-gray-500">
                      In milliseconds, before hiding the notification. Leave it
                      empty to keep it visible.
                    </label>
                    <Input
                      id="delay"
                      min={0}
                      value={formData?.timer ?? undefined}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          timer: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <br />

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={formData?.styling?.showClosingButton}
                          onCheckedChange={(checked) =>
                            handleStylingChange(
                              "showClosingButton",
                              Boolean(checked)
                            )
                          }
                        />

                        <Label htmlFor="airplane-mode">Closing button</Label>
                      </div>
                    </div>

                    <label className="text-sm text-gray-500">
                      Allow user to close the notification
                    </label>
                  </div>
                  <br />
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <Button
              className="w-full"
              onClick={async () => {
                setIsLoading(true); // Start loading
                try {
                  await onSubmit(formData); // Perform the form submission
                } catch (error) {
                  console.error("Error saving campaign:", error);
                } finally {
                  setIsLoading(false); // End loading
                }
              }}
              disabled={isLoading || !formData?.message} // Disable button during loading
            >
              {isLoading ? (
                <span className="flex items-center space-x-2">
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    ></path>
                  </svg>
                  <span>Saving...</span>
                </span>
              ) : (
                "Save Campaign"
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-none shadow-none">
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <label className="text-sm text-gray-500">
                Toggle the options below to preview the notification.
              </label>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={isMobilePreview}
                    onCheckedChange={() => setIsMobilePreview((prev) => !prev)}
                  />
                  <Label htmlFor="airplane-mode">Mobile View</Label>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={isVerifiedPreview}
                    onCheckedChange={() =>
                      setIsVerifiedPreview((prev) => !prev)
                    }
                  />
                  <Label htmlFor="airplane-mode">Contracts Verification</Label>
                </div>
              </div>
            </div>
            <br />
            <div
              dangerouslySetInnerHTML={{
                __html: (
                  createNotification(
                    {
                      campaign: 0,
                      type: "swaps",
                      subscriptionPlan: "free", //todo adapt to user plan
                      message: formData?.message ?? "Your message here",
                      subMessage:
                        formData?.sub_message ?? "Your sub message here",
                      iconName: (formData?.iconName as IconName) ?? undefined,
                      iconSrc: formData?.iconSrc ?? undefined,
                      styling: {
                        ...defaultStyling,
                        ...(formData?.styling as NotificationStylingRequired),
                      },
                      verifications: [
                        {
                          chainId: 1,
                          contractAddress:
                            "0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640",
                          isOwnershipVerified: false,
                          chainName: "Ethereum",
                          url: "https://etherscan.io/address/0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640",
                        },
                      ],
                    },
                    {
                      isPreview: true,
                      isMobilePreview,
                      isVerifiedPreview,
                      previewMetrics: availableMetricNames,
                    }
                  ) ?? (new HTMLElement() as any)
                ).innerHTML,
              }}
            ></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
