// src/widget.ts

import { isPixelEnv, PixelEnv } from "./constants";
import { trpcApiClient } from "./trpc";
import {
  showNotification,
  hideNotification as deleteNotification,
} from "./notification"; // Add hideNotification
import { getSessionId, getUserId } from "./session";

// Main function to initialize the widget
async function initializeWidget() {
  try {
    // Get the current script and extract the API key and env from the URL parameters
    const script = document.currentScript as HTMLScriptElement;
    const apiKey = script
      ? new URL(script.src).searchParams.get("apiKey")
      : null;
    const envParam = script
      ? new URL(script.src).searchParams.get("env")
      : null;
    const env: PixelEnv = isPixelEnv(envParam) ? envParam : "production";

    // Helper function to check if the current URL is allowed
    const isUrlAllowed = (currentUrl: string, pathnames?: string[]) => {
      if (!pathnames?.length) {
        return true; // No restrictions
      }

      // Separate plain URLs and regex patterns
      const plainUrls = pathnames.filter(
        (url) => !url.startsWith("^") && !url.endsWith("$")
      );
      const regexPatterns = pathnames
        .filter((url: string) => url.startsWith("^") && url.endsWith("$"))
        .map((regexStr: string) => {
          try {
            return new RegExp(regexStr);
          } catch (e) {
            console.error("Invalid regex pattern:", regexStr);
            return null;
          }
        })
        .filter((regex: RegExp | null) => regex !== null);

      // Match against plain URLs or regex patterns
      return (
        plainUrls?.includes(currentUrl) ||
        regexPatterns?.some((regex) => regex.test(currentUrl))
      );
    };

    // Function to handle URL changes
    async function handleUrlChange() {
      if (!apiKey) {
        throw new Error("API key is missing");
      }

      // Fetch notification configuration from the server
      const notification = await trpcApiClient(
        env,
        apiKey
      ).campaigns.getNotification.query({});

      if (isUrlAllowed(window.location.pathname, notification.pathnames)) {
        // Show notification if URL is allowed
        deleteNotification(); // To update if necessary
        showNotification(notification);

        // Track the impression after showing the notification
        await trpcApiClient(env, apiKey!).campaigns.trackImpression.mutate({
          campaignId: notification.campaign,
          session: getSessionId(),
          user: getUserId(),
        });
      } else {
        // Hide notification if URL is not allowed
        deleteNotification();
      }
    }

    // Initial check for the current URL
    handleUrlChange();

    // Intercept pushState and replaceState
    (function () {
      const originalPushState = history.pushState;
      const originalReplaceState = history.replaceState;

      history.pushState = function (...args) {
        originalPushState.apply(this, args);
        handleUrlChange();
      };

      history.replaceState = function (...args) {
        originalReplaceState.apply(this, args);
        handleUrlChange();
      };

      // Listen to popstate (for back/forward navigation)
      window.addEventListener("popstate", handleUrlChange);

      // Listen to hashchange (for hash-based navigation)
      window.addEventListener("hashchange", handleUrlChange);
    })();
  } catch (error) {
    console.error("Error while loading notification:", error);
  }
}

initializeWidget();
