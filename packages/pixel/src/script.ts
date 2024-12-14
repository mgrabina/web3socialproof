// src/widget.ts

import { Experiment, isMobile, Variant } from "@web3socialproof/shared";
import { isPixelEnv, PixelEnv } from "./constants";
import {
  hideNotification as deleteNotification,
  showNotification,
} from "./notification"; // Add hideNotification
import { getSessionId, getUserId } from "./session";
import { trpcApiClient } from "./trpc";

// Variables to store apiKey and env for use in other functions
let apiKey: string | null = null;
let env: PixelEnv = "production";
let variant: Variant | undefined;
let experiment: Experiment | undefined;
let lastPathnameWithSearch: string | null = null;

// Main function to initialize the widget
async function initializeWidget() {
  try {
    // Get the current script and extract the API key and env from the URL parameters
    const script = document.currentScript as HTMLScriptElement;
    apiKey = script ? new URL(script.src).searchParams.get("apiKey") : null;
    const envParam = script
      ? new URL(script.src).searchParams.get("env")
      : null;
    env = isPixelEnv(envParam) ? envParam : "production";

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
      const currentPathnameWithSearch = `${window.location.pathname}${window.location.search}`;

      // Ignore changes if only the hash changes
      if (currentPathnameWithSearch === lastPathnameWithSearch) {
        console.info("[Herd] Ignoring hash change.");
        return;
      }

      lastPathnameWithSearch = currentPathnameWithSearch;

      if (!apiKey) {
        throw new Error("API key is missing");
      }

      // Fetch notification configuration from the server
      const herdData = await trpcApiClient(
        env,
        apiKey
      ).experiments.getNotification.query({});

      if (!herdData) {
        console.info("[Herd] No notification to show.");

        // Hide notification if there is no notification to show
        deleteNotification();
        return;
      }

      variant = herdData.variant;
      experiment = herdData.experiment;

      const shouldHide =
        isMobile() && herdData.variant?.styling.mobilePosition === "none";

      if (
        isUrlAllowed(window.location.pathname, herdData.experiment.pathnames) &&
        !shouldHide
      ) {
        // Show notification if URL is allowed
        deleteNotification(); // To update if necessary
        showNotification(herdData);

        // Track the impression after showing the notification
        await trpcApiClient(env, apiKey).experiments.trackImpression.mutate({
          experimentId: herdData.experiment.experimentId,
          variantId: herdData.variant?.variantId,
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
// Conversion tracking function
async function trackConversion(id?: string) {
  try {
    if (!apiKey) {
      console.error("[Herd] API key is missing.");
      return;
    }

    if (!experiment) {
      console.error(
        "[Herd] Experiment is missing. Is there a Herd experiment running?"
      );
      return;
    }

    // Send conversion data to the server
    await trpcApiClient(env, apiKey).experiments.trackConversion.mutate({
      session: getSessionId(),
      user: getUserId(),
      experimentId: experiment?.experimentId,
      variantId: variant?.variantId ?? undefined,
      hostname: window.location.hostname,
      pathname: window.location.pathname,
      elementId: id,
    });
  } catch (error) {
    console.error("Error tracking conversion:", error);
  }
}

// Expose the functions under the 'herd' namespace on the global object
(function () {
  const globalScope =
    typeof globalThis !== "undefined"
      ? (globalThis as any)
      : typeof self !== "undefined"
      ? (self as any)
      : typeof window !== "undefined"
      ? (window as any)
      : undefined;

  if (globalScope) {
    globalScope.herd = globalScope.herd || {};
    globalScope.herd.trackConversion = trackConversion;
  } else {
    console.warn("Global scope not found; 'herd' namespace not attached.");
  }
})();

initializeWidget();
