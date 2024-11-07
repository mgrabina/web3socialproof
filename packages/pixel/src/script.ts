// src/widget.ts

import { inferRouterOutputs } from "@trpc/server";
import { isPixelEnv, PixelEnv } from "./constants";
import { backendUrl, trpcApiClient } from "./trpc";
import { AppRouter } from "../../../apps/backend/src/trpc/router";

// Function to show a notification on the page
function showNotification(
  message: string,
  submessage: string,
  href: string
): void {
  console.log("Showing notification");

  try {
    const notification = document.createElement("div");
    notification.style.display = "flex";
    notification.style.alignItems = "center";
    notification.style.padding = "20px";
    notification.style.borderRadius = "100px";
    notification.style.backgroundColor = "#f7f7f7";
    notification.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
    notification.style.position = "fixed";
    notification.style.bottom = "20px";
    notification.style.left = "20px";
    notification.style.zIndex = "1000";
    notification.style.fontFamily = "Arial, sans-serif";

    // Icon container
    const iconContainer = document.createElement("div");
    iconContainer.style.width = "50px";
    iconContainer.style.height = "50px";
    iconContainer.style.backgroundColor = "rgba(255, 99, 71, 0.1)";
    iconContainer.style.borderRadius = "50%";
    iconContainer.style.display = "flex";
    iconContainer.style.alignItems = "center";
    iconContainer.style.justifyContent = "center";
    iconContainer.style.marginRight = "15px";

    // Icon
    const icon = document.createElement("img");
    icon.src = "https://img.icons8.com/ios-glyphs/30/fa314a/fire-element.png";
    icon.alt = "Fire icon";
    icon.style.width = "24px";
    icon.style.height = "24px";
    iconContainer.appendChild(icon);

    // Text container
    const textContainer = document.createElement("div");

    // Title
    const title = document.createElement("p");
    title.textContent = message;
    title.style.fontSize = "14px";
    title.style.fontWeight = "bold";
    title.style.color = "#333";
    title.style.margin = "0";

    // Subtitle
    const subtitle = document.createElement("p");
    subtitle.textContent = submessage;
    subtitle.style.fontSize = "10px";
    subtitle.style.color = "#888";
    subtitle.style.margin = "3px 0 0 0";

    // Verified link
    const verifiedLink = document.createElement("a");
    verifiedLink.href = href;
    verifiedLink.target = "_blank";
    verifiedLink.textContent = "Verified on-chain by Talaria";
    verifiedLink.style.fontSize = "10px";
    verifiedLink.style.color = "#4a63e7";
    verifiedLink.style.textDecoration = "none";
    verifiedLink.style.marginTop = "4px";
    verifiedLink.style.display = "flex";
    verifiedLink.style.alignItems = "center";

    // Verified icon
    const verifiedIcon = document.createElement("img");
    verifiedIcon.src = "https://img.icons8.com/fluency/48/verified-badge.png";
    verifiedIcon.alt = "Verified icon";
    verifiedIcon.style.width = "12px";
    verifiedIcon.style.opacity = "0.8";
    verifiedIcon.style.height = "10px";
    verifiedIcon.style.marginRight = "5px";
    verifiedLink.prepend(verifiedIcon);

    // Assemble the text container
    textContainer.appendChild(title);
    textContainer.appendChild(subtitle);
    textContainer.appendChild(verifiedLink);

    // Assemble the notification
    notification.appendChild(iconContainer);
    notification.appendChild(textContainer);

    document.addEventListener("DOMContentLoaded", () => {
      // Place your notification code here
      document.body.appendChild(notification);
    });

    // Optional: Remove the notification after 5 seconds
    // setTimeout(() => {
    //   document.body.removeChild(notification);
    // }, 5000);
  } catch (error) {
    console.error("Error showing notification:", error);
  }
}

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

    try {
      if (!apiKey) {
        console.error("API key is missing");
        return;
      } else {
        console.log("API key: ", apiKey);
      }

      type NotificationOutput =
        inferRouterOutputs<AppRouter>["campaigns"]["getNotification"];

      const notification = await trpcApiClient(
        env
      ).campaigns.getNotification.query({
        apiKey,
      });

      if (notification) {
        console.log("Response: ", notification);
        showNotification(
          notification.message,
          notification.subMessage,
          "https://talaria.com"
        );
      } else {
        console.error("Error fetching data or empty response");
      }
    } catch (error) {
      // On error, do not show notification and log the error
      console.error("Error fetching notification:", error);
    }
  } catch (error) {
    console.error("Error loading widget configuration:", error);
  }
}

initializeWidget();
