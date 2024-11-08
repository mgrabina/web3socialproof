import { inferRouterOutputs } from "@trpc/server";
import { AppRouter } from "../../../apps/backend/src/trpc/router";

type NotificationOutput =
  inferRouterOutputs<AppRouter>["campaigns"]["getNotification"];

// Function to show a notification on the page
export function showNotification(params: NotificationOutput): void {
  console.log("Showing notification");

  try {
    const notification = document.createElement("div");
    notification.style.display = "flex";
    notification.style.alignItems = "center";
    notification.style.padding = "20px";
    notification.style.borderRadius = params.styling.borderRadius;
    notification.style.backgroundColor = params.styling.backgroundColor;
    notification.style.boxShadow = params.styling.boxShadow;
    notification.style.position = "fixed";
    notification.style.bottom = "20px";
    notification.style.left = "20px";
    notification.style.zIndex = "1000";
    notification.style.fontFamily = params.styling.fontFamily;

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
    icon.src = params.icon;
    icon.alt = "Notification Icon";
    icon.style.width = "24px";
    icon.style.height = "24px";
    iconContainer.appendChild(icon);

    // Text container
    const textContainer = document.createElement("div");

    // Title
    const title = document.createElement("p");
    title.textContent = params.message;
    title.style.fontSize = "14px";
    title.style.fontWeight = "bold";
    title.style.color = params.styling.titleColor;
    title.style.margin = "0";

    // Subtitle
    const subtitle = document.createElement("p");
    subtitle.textContent = params.subMessage;
    subtitle.style.fontSize = "10px";
    subtitle.style.color = params.styling.subtitleColor;
    subtitle.style.margin = "3px 0 0 0";

    // Verified link
    const verifiedLink = document.createElement("a");
    verifiedLink.href = params.verificationLink;
    verifiedLink.target = "_blank";
    verifiedLink.textContent = "Verified on-chain by Talaria";
    verifiedLink.style.fontSize = "10px";
    verifiedLink.style.color = "#4a63e7";
    verifiedLink.style.cursor = "pointer";
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

    // Todo: replace timer for recognizing when DOM is really loaded
    setTimeout(() => {
      console.log("adding");
      document.body.appendChild(notification);
    }, 3000);
  } catch (error) {
    console.error("Error showing notification:", error);
  }
}
