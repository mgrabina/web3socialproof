// src/widget.ts

import { inferRouterOutputs } from "@trpc/server";
import { isPixelEnv, PixelEnv } from "./constants";
import { backendUrl, trpcApiClient } from "./trpc";
import { showNotification } from "./notification";
import { getSessionId, getUserId } from "./session";

// Main function to initialize the widget
async function initializeWidget() {
  try {
    // Get the current script and extract the API key from the URL parameters
    const script = document.currentScript as HTMLScriptElement;
    const apiKey = script
      ? new URL(script.src).searchParams.get("apiKey")
      : null;
    const envParam = script
      ? new URL(script.src).searchParams.get("env")
      : null;
    const env: PixelEnv = isPixelEnv(envParam) ? envParam : "production";

    if (!apiKey) {
      throw new Error("API key is missing");
    }

    const notification = await trpcApiClient(
      env,
      apiKey
    ).campaigns.getNotification.query({});

    await trpcApiClient(env, apiKey).campaigns.trackImpression.mutate({
      campaignId: notification.campaign,
      session: getSessionId(),
      user: getUserId(),
    });

    showNotification(notification);
  } catch (error) {
    console.error("Error while loading notification:", error);
  }
}

initializeWidget();
