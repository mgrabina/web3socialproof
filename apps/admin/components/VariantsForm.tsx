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
import { useUserContext } from "@/lib/context/useUserContext";
import { capitalize, capitalizeEachWord } from "@/utils/strings/string.utils";
import { createSupabaseClientForClientSide } from "@/utils/supabase/client";
import { InsertVariant, SelectMetric } from "@web3socialproof/db";
import {
  createNotification,
  defaultStyling,
  DestkopPositions,
  IconName,
  iconNames,
  iconsSvgs,
  MobilePositions,
  NotificationStylingRequired,
} from "@web3socialproof/shared";
import parse from "html-react-parser";
import { Stars } from "lucide-react";
import { useEffect, useState } from "react";
import ProtocolUrlInputDialog from "./ProtocolUrlInputDialog";
import { Skeleton } from "./ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface VariantsFormProps {
  initialData?: {
    name?: string;
    message?: string;
    sub_message?: string;
    styling: any;
    iconSrc?: string | null;
    iconName?: string | null;
    delay?: number | null;
    timer?: number | null;
  };
  onSubmit: (data: any, createABTesting: boolean) => Promise<void>;
}

export default function VariantsForm({
  initialData = {
    iconName: "flame",
    styling: { ...defaultStyling },
  },
  onSubmit,
}: VariantsFormProps) {
  const [formData, setFormData] =
    useState<
      Partial<
        (InsertVariant & { styling: NotificationStylingRequired }) | undefined
      >
    >();
  const [metrics, setMetrics] = useState<SelectMetric[] | undefined>();
  const [availableMetricNames, setAvailableMetricNames] = useState(
    new Set<string>()
  );

  const { protocol } = useUserContext();
  const supabase = createSupabaseClientForClientSide();

  useEffect(() => {
    if (initialData && (!formData || !formData.styling))
      setFormData(initialData);
  }, [initialData, formData]);

  const [fetchingStyling, setFetchingStyling] = useState(true);
  useEffect(() => {
    // Get initial styling from other variants
    async function fetchVariant() {
      try {
        if (!protocol) {
          throw new Error("No protocol found.");
        }

        const { data, error } = await supabase
          .from("variants_table")
          .select("*")
          .eq("protocol_id", protocol?.id)
          .order("created_at", { ascending: false }) // Get the latest variant
          .limit(1);

        if (!error && data.length) {
          setFormData({
            styling: {
              ...defaultStyling,
              ...(data[0].styling as NotificationStylingRequired),
            },
          });
        }
      } catch (error) {
        console.error("Failed to fetch variants to autoload stying:", error);
      } finally {
        setFetchingStyling(false);
      }
    }

    if (!protocol) {
      return;
    }

    fetchVariant();
  }, [protocol, supabase]);

  useEffect(() => {
    const supabase = createSupabaseClientForClientSide();

    const fetchMetrics = async () => {
      try {
        if (!protocol?.id) {
          throw new Error("No protocol found.");
        }

        const { data, error } = await supabase
          .from("metrics_table")
          .select()
          .eq("protocol_id", protocol?.id);

        if (error || !data) {
          toast({
            title: "Error",
            description: "Failed to fetch metrics.",
            variant: "destructive",
          });
          return;
        }

        const parsed = data.map((m) => ({
          ...m,
          ...(m.last_calculated !== null
            ? { last_calculated: new Date(m.last_calculated) }
            : { last_calculated: null }),
        }));

        setMetrics(parsed ?? []);
        setAvailableMetricNames(
          new Set(parsed.map((metric: SelectMetric) => metric.name))
        );
      } catch (error) {
        console.error("Error fetching metrics:", error);
      }
    };

    if (!protocol) {
      return;
    }

    fetchMetrics();
  }, [protocol]);

  const [isLoading, setIsLoading] = useState(false);

  const [isMobilePreview, setIsMobilePreview] = useState(false);
  const [isVerifiedPreview, setIsVerifiedPreview] = useState(true);

  const handleStylingChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      styling: {
        ...(prev.styling as NotificationStylingRequired),
        [field]: value,
      },
    }));
  };

  const [isUrlDialogOpen, setIsUrlDialogOpen] = useState(false);
  const [protocolUrl, setProtocolUrl] = useState<string | undefined>(
    protocol?.url ?? undefined
  );
  const [configLoading, setConfigLoading] = useState(false);

  const generateUsingHerdIA = async () => {
    let targetUrl = protocolUrl;

    if (!protocolUrl) {
      if (!protocol) {
        toast({
          title: "Error",
          description: "No protocol found.",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from("protocol_table")
        .select("url")
        .eq("id", protocol?.id)
        .single();

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch protocol URL.",
          variant: "destructive",
        });
        return;
      } else {
        if (!data?.url) {
          setIsUrlDialogOpen(true);
          return;
        }

        setProtocolUrl(data?.url);
        targetUrl = data?.url;
      }
    }

    if (!targetUrl) {
      toast({
        title: "Error",
        description: "No URL provided.",
        variant: "destructive",
      });
      return;
    }

    // Now we have url let's generate variant
    try {
      setConfigLoading(true);

      const dimensions = {
        width: 1920,
        height: 1080,
      };

      const response = await fetch(
        `/public/demo/api/config?url=${encodeURIComponent(targetUrl)}&width=${
          dimensions.width
        }&height=${dimensions.height}`
      );
      if (!response.ok) {
        throw new Error("Failed to generate configuration");
      }

      type configResponse = {
        fontFamily: "string";
        titleColor: "string";
        subtitleColor: "string";
        backgroundColor: "string";
        iconBackgroundColor: "string";
        iconBorderRadius: "string";
        iconColor: "string";
        borderRadius: "string";
        border: "string";
        boxShadow: "string";
        title: "string";
        subtitle: "string";
      };

      const { config: received } = await response.json();
      const config = JSON.parse(received) as configResponse;

      setFormData((prev) => ({
        ...prev,
        message: prev?.message?.length ? prev.message : config?.title,
        sub_message: prev?.sub_message?.length
          ? prev.sub_message
          : config?.subtitle,
        styling: {
          ...(prev?.styling as NotificationStylingRequired),
          ...config,
        },
      }));

      toast({
        title: "Configuration generated",
        description:
          "Herd IA generated the configuration based on your site's branding and storytelling. Remember to review it and replace numbers with your previously created metrics.",
      });
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        title: error,
        description: "Please refresh or try again later",
        variant: "destructive",
      });
    } finally {
      setConfigLoading(false);
    }
  };

  const [createABTesting, setCreateABTesting] = useState(false);

  return (
    <div className="container mx-auto p-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between">
              <h2>Variant Details</h2>
              <Button
                variant="outline"
                onClick={generateUsingHerdIA}
                disabled={configLoading}
              >
                {configLoading ? (
                  <span className="flex items-center space-x-2">
                    <svg
                      className="animate-spin h-4 w-4 text-gray-500"
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
                    <span>Loading...</span>
                  </span>
                ) : (
                  <>
                    Use Herd IA <Stars className="ml-2"></Stars>
                  </>
                )}
              </Button>
            </CardTitle>
          </CardHeader>

          <ProtocolUrlInputDialog
            open={isUrlDialogOpen}
            setOpen={setIsUrlDialogOpen}
            setUrl={setProtocolUrl}
          />

          <CardContent className="space-y-4 overflow-y-scroll max-h-[750px]">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="A unique name to easily identify your variant"
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
                <AccordionTrigger>Timing</AccordionTrigger>
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

            <br />
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={createABTesting}
                  onCheckedChange={() => setCreateABTesting((prev) => !prev)}
                />
                <Label className="w-[100px]">AB Testing</Label>
              </div>

              <span className="text-sm text-gray-500 w-full ">
                Create an A/B test experiment with this variant.
              </span>
            </div>
            <br />

            <Button
              className="w-full"
              onClick={async () => {
                setIsLoading(true); // Start loading
                try {
                  await onSubmit(formData, createABTesting); // Perform the form submission
                } catch (error) {
                  console.error("Error saving variant:", error);
                } finally {
                  setIsLoading(false); // End loading
                }
              }}
              disabled={isLoading || !formData?.message || !formData.name} // Disable button during loading
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
                "Save Variant"
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
                    checked={isVerifiedPreview}
                    onCheckedChange={() =>
                      setIsVerifiedPreview((prev) => !prev)
                    }
                  />
                  <Label htmlFor="airplane-mode">Contracts Verification</Label>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={isMobilePreview}
                    onCheckedChange={() => setIsMobilePreview((prev) => !prev)}
                  />
                  <Label htmlFor="airplane-mode">Mobile View</Label>
                </div>
              </div>
            </div>
            <br />
            <div
              dangerouslySetInnerHTML={{
                __html: (
                  createNotification(
                    {
                      variant: {
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
                        variantId: 0,
                      },
                      experiment: {
                        experimentId: 0,
                      },
                      subscriptionPlan: "free", //todo adapt to user plan
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

            {fetchingStyling && (
              <>
                <br />
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500 w-full text-center">
                    Fetching styling from your last variant if available...
                  </span>
                </div>
                <br />
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
