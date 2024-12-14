"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import {
  createNotification,
  defaultStyling,
} from "@web3socialproof/shared/constants";
import { ArrowRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export type AICustomization = {
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

export default function ScreenshotPreview() {
  const [configLoading, setConfigLoading] = useState(false);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [config, setConfig] = useState<AICustomization | null>(null);
  const [notification, setNotification] = useState<HTMLElement | null>(null);

  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }, []);

  const router = useRouter();

  const params = useSearchParams();
  const urlParam = params.get("url");
  const targetUrl = urlParam;

  const [customUrlParam, setCustomUrlParam] = useState("");

  const handleGenerateConfig = async () => {
    if (!targetUrl || !dimensions?.height || !dimensions?.width) {
      return;
    }

    setConfigLoading(true);
    try {
      const response = await fetch(
        `/public/demo/api/config?url=${encodeURIComponent(targetUrl)}&width=${
          dimensions.width
        }&height=${dimensions.height}`
      );
      if (!response.ok) {
        throw new Error("Failed to generate configuration");
      }

      const { screenshot, config } = await response.json();

      setConfig(JSON.parse(config));
      setScreenshot(screenshot);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to generate configuration: " + error,
        variant: "destructive",
      });
    } finally {
      setConfigLoading(false);
    }
  };

  useEffect(() => {
    if (targetUrl && dimensions?.height && dimensions?.width) {
      handleGenerateConfig().catch(console.error);
    }
  }, [targetUrl, dimensions?.height, dimensions?.width]);

  useEffect(() => {
    if (configLoading === true || !config) {
      return;
    }

    setNotification(
      createNotification({
        campaign: 0,
        type: "swaps",
        subscriptionPlan: "free", //todo adapt to user plan
        message: config?.title || "10k users already joined!",
        subMessage: config?.subtitle || "Are you ready to join?",
        iconName: "flame",
        styling: {
          ...defaultStyling,
          ...config,
        },
        verifications: [
          {
            chainId: 1,
            contractAddress: "0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640",
            isOwnershipVerified: false,
            chainName: "Ethereum",
            url: "https://etherscan.io/address/0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640",
          },
        ],
      })
    );
  }, [config, configLoading]);

  const handleGenerate = () => {
    if (customUrlParam) {
      router.push(`/public/demo?url=${encodeURIComponent(customUrlParam)}`);
    }
  };

  if (!targetUrl?.length) {
    // Show input that redirects to the same page with the url param
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>URL Generator</CardTitle>
            <CardDescription>
              Enter a URL to generate a custom demo page
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              <Input
                type="url"
                placeholder="https://example.com"
                value={customUrlParam}
                onChange={(e) => setCustomUrlParam(e.target.value)}
                className="flex-grow"
              />
              <Button
                onClick={handleGenerate}
                disabled={!customUrlParam}
                className="w-full"
              >
                Generate
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="w-full h-6 bg-yellow-100 p-4 flex justify-center items-center">
        {configLoading ? (
          <span className="text-gray-800 text-center">
            Generating a demo based on the branding and storytelling of your
            site. This may take a few seconds.
          </span>
        ) : (
          <span className="text-gray-800 text-center">
            This demo is generated using IA based on the branding and
            storytelling of your site. Makes sense? Lets{" "}
            <a
              className="
            text-blue-600 hover:underline hover:text-blue-800 transition-all
            "
              href="https://app.gobyherd.com"
            >
              do an AB test
            </a>{" "}
            and see if it works!
          </span>
        )}
      </div>
      {notification && (
        <div
          dangerouslySetInnerHTML={{
            __html: notification.innerHTML,
          }}
        ></div>
      )}

      {configLoading && (
        <div className="w-full">
          {/* Header Skeleton */}
          <header className="w-full py-4 px-6 flex items-center justify-between border-b">
            <Skeleton className="h-8 w-32" />
            <div className="flex space-x-4">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
          </header>

          {/* Hero Section Skeleton */}
          <section className="w-full py-12 px-6">
            <div className="max-w-4xl mx-auto">
              <Skeleton className="h-12 w-3/4 mb-4" />
              <Skeleton className="h-6 w-full mb-2" />
              <Skeleton className="h-6 w-full mb-2" />
              <Skeleton className="h-6 w-2/3 mb-6" />
              <Skeleton className="h-12 w-40" />
            </div>
          </section>

          {/* Features Section Skeleton */}
          <section className="w-full py-12 px-6 bg-gray-50">
            <div className="max-w-6xl mx-auto">
              <Skeleton className="h-10 w-1/3 mx-auto mb-8" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <Skeleton className="h-16 w-16 rounded-full mb-4" />
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Footer Skeleton */}
          <footer className="w-full py-8 px-6 bg-gray-100">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
              <Skeleton className="h-8 w-32 mb-4 md:mb-0" />
              <div className="flex space-x-4">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </div>
          </footer>
        </div>
      )}
      {screenshot && (
        <div>
          <img
            src={`data:image/png;base64,${screenshot}`}
            alt="Screenshot Preview"
            className="border"
          />
        </div>
      )}
    </div>
  );
}
