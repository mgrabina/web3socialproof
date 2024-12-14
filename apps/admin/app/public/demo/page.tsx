"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import {
  createNotification,
  defaultStyling,
} from "@web3socialproof/shared/constants";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAsync } from "react-async";

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
  const [configLoading, setConfigLoading] = useState(true);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [config, setConfig] = useState<AICustomization | null>(null);
  const [notification, setNotification] = useState<HTMLElement | null>(null);

  const dimensions = {
    width: innerWidth,
    height: innerHeight,
  };

  const params = useSearchParams();
  const urlParam = params.get("url");
  const targetUrl = urlParam?.includes("http")
    ? urlParam
    : `https://${urlParam}`;

  const handleGenerateConfig = async () => {
    if (!targetUrl) {
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
        description: "Failed to generate configuration.",
        variant: "destructive",
      });
    } finally {
      setConfigLoading(false);
    }
  };

  useAsync({
    promiseFn: async () => {
      if (targetUrl && dimensions.height && dimensions.width) {
        await Promise.all([handleGenerateConfig()]);
      }
    },
    watch: [targetUrl, dimensions],
  });

  useEffect(() => {
    if (configLoading === true) {
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

  return (
    <div>
      <div className="w-full h-6 bg-yellow-100 p-4 flex justify-center items-center">
        <span className="text-black text-center">
          This demo is generated using IA based on the branding and storytelling
          of your site.
        </span>
      </div>
      {notification ? (
        <div
          dangerouslySetInnerHTML={{
            __html: notification.innerHTML,
          }}
        ></div>
      ) : (
        <span></span>
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
