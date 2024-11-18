import { z } from "zod";
import { shortenAddress } from "../utils/evm";

export const notificationTypeSchema = z.union([
  z.literal("swaps"),
  z.literal("TVL"),
  z.literal("walletsConnected"),
]);
export type NotificationType = z.infer<typeof notificationTypeSchema>;

// Optional schema where all fields are optional
export const notificationStylingSchemaOptional = z.object({
  fontFamily: z.string().optional(),
  titleColor: z.string().optional(),
  subtitleColor: z.string().optional(),
  backgroundColor: z.string().optional(),
  iconBackgroundColor: z.string().optional(),
  iconColor: z.string().optional(),
  border: z.string().optional(),
  borderRadius: z.string().optional(),
  boxShadow: z.string().optional(),
});

// Required schema where all fields are strictly required
export const notificationStylingSchemaRequired = z.object({
  fontFamily: z.string(),
  titleColor: z.string(),
  subtitleColor: z.string(),
  backgroundColor: z.string(),
  iconBackgroundColor: z.string(),
  iconColor: z.string(),
  borderRadius: z.string(),
  border: z.string(),
  boxShadow: z.string(),
});

// Type definitions
export type NotificationStylingOptional = z.infer<
  typeof notificationStylingSchemaOptional
>;
export type NotificationStylingRequired = z.infer<
  typeof notificationStylingSchemaRequired
>;

export const defaultStyling: NotificationStylingRequired = {
  fontFamily: "Arial, sans-serif",
  titleColor: "#333",
  subtitleColor: "#888",
  border: "1px solid #e0e0e0",
  borderRadius: "100px",
  backgroundColor: "white",
  iconBackgroundColor: "#FF6347",
  iconColor: "white",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
};

export const notificationOptionsSchema = z.object({
  campaign: z.number(),
  type: notificationTypeSchema,
  message: z.string(),
  subMessage: z.string(),
  verificationLink: z.string(),
  subscriptionPlan: z.string(),
  styling: notificationStylingSchemaOptional,
});
export type NotificationOptions = z.infer<typeof notificationOptionsSchema>;

export const verificationInfoSchema = z.object({
  chainId: z.number(),
  contractAddress: z.string(),
  isOwnershipVerified: z.boolean(),
  chainName: z.string().optional(),
  url: z.string().optional(),
});

export type VerificationInfo = z.infer<typeof verificationInfoSchema>;

export const notificationResponseSchema = z.object({
  campaign: z.number(),
  type: notificationTypeSchema,
  icon: z.string(),
  message: z.string(),
  subMessage: z.string(),
  verifications: z.array(verificationInfoSchema),
  styling: notificationStylingSchemaRequired,
  subscriptionPlan: z.string(),
});
export type NotificationResponse = z.infer<typeof notificationResponseSchema>;

// Function to style {{METRIC}} placeholders
function renderTextWithMetricStyles(
  text: string,
  baseColor: string,
  availableMetricNames: Set<string>
): HTMLDivElement {
  if (
    !availableMetricNames.size ||
    !text ||
    !text.includes("{") ||
    !text.includes("}")
  ) {
    const span = document.createElement("div");
    span.textContent = text;
    span.style.color = baseColor;

    return span;
  }

  const container = document.createElement("div");
  const regex = /{(.*?)}/g;
  const parts = text.split(regex);

  parts.forEach((part, index) => {
    if (index % 2 === 1) {
      // This is a placeholder (e.g., {METRIC})
      const isValidMetric = availableMetricNames?.has(part);
      const span = document.createElement("span");
      span.textContent = `{${part}}`;
      span.style.color = isValidMetric ? "#9EDF9C" : "#FA7070";
      span.style.fontWeight = "bold";
      container.appendChild(span);
    } else {
      // Regular text
      const span = document.createElement("span");
      span.textContent = part;
      span.style.color = baseColor;
      container.appendChild(span);
    }
  });

  return container;
}

export const createNotification = (
  params: NotificationResponse,
  isPreview = false,
  metrics = new Set<string>()
): HTMLElement => {
  const notification = document.createElement("div");
  notification.style.display = "flex";
  notification.style.alignItems = "center";
  notification.style.padding = "20px";
  notification.style.borderRadius =
    params.styling.borderRadius || defaultStyling.borderRadius;
  notification.style.backgroundColor =
    params.styling.backgroundColor || defaultStyling.backgroundColor;
  notification.style.boxShadow =
    params.styling.boxShadow || defaultStyling.boxShadow;
  notification.style.position = isPreview ? "relative" : "fixed";
  notification.style.bottom = isPreview ? "0" : "20px";
  notification.style.left = isPreview ? "0" : "20px";
  notification.style.zIndex = "1000";
  notification.style.width = "300px";
  notification.style.fontFamily =
    params.styling.fontFamily || defaultStyling.fontFamily;

  // Icon container
  const iconContainer = document.createElement("div");
  iconContainer.style.width = "50px";
  iconContainer.style.height = "50px";
  iconContainer.style.backgroundColor =
    params.styling.iconBackgroundColor || defaultStyling.iconBackgroundColor;
  iconContainer.style.borderRadius = "50%";
  iconContainer.style.display = "flex";
  iconContainer.style.alignItems = "center";
  iconContainer.style.justifyContent = "center";
  iconContainer.style.marginRight = "15px";

  // Icon
  const icon = document.createElement("img");
  icon.src = params.icon || "https://www.svgrepo.com/show/13210/flame.svg";
  icon.alt = "Notification Icon";
  icon.style.width = "24px";
  icon.style.height = "24px";
  icon.style.color = params.styling.iconColor || defaultStyling.iconColor;
  iconContainer.appendChild(icon);

  // Text container
  const textContainer = document.createElement("div");

  // Title
  let title;
  if (metrics.size)
    title = renderTextWithMetricStyles(
      params.message,
      params.styling.titleColor,
      metrics
    );
  else {
    title = document.createElement("p");
    title.textContent = params.message;
    title.style.fontSize = "14px";
    title.style.fontWeight = "bold";
    title.style.color = params.styling.titleColor;
    title.style.margin = "0";
  }

  // Subtitle
  let subtitle;
  if (metrics.size)
    subtitle = renderTextWithMetricStyles(
      params.subMessage,
      params.styling.subtitleColor,
      metrics
    );
  else {
    subtitle = document.createElement("p");
    subtitle.textContent = params.subMessage;
    subtitle.style.fontSize = "10px";
    subtitle.style.color = params.styling.subtitleColor;
    subtitle.style.margin = "3px 0 0 0";
  }

  // Verified link
  // Create the container for the verification message
  const verificationContainer = document.createElement("div");
  verificationContainer.style.position = "relative";
  verificationContainer.style.display = "inline-block";

  // Determine if all verifications are ownership verified
  const allVerified = params.verifications.every((v) => v.isOwnershipVerified);
  const textColor = allVerified ? "#4a63e7" : "#d8a200"; // Blue if verified, dark yellow otherwise
  const iconSrcIfVerified = (verified: boolean) =>
    verified
      ? "https://img.icons8.com/fluency/48/verified-badge.png"
      : "https://img.icons8.com/fluency/48/warning-shield.png"; // Different icons

  // Main link/button
  const verificationLink = document.createElement("label");
  verificationLink.style.color = textColor;
  verificationLink.style.fontSize = "10px";
  verificationLink.style.textDecoration = "none";
  verificationLink.style.cursor = "pointer";
  verificationLink.style.display = "flex";
  verificationLink.style.alignItems = "center";
  verificationLink.textContent = allVerified
    ? `Verified on-chain${
        params.subscriptionPlan.toLocaleLowerCase() != "enterprise"
          ? " by Herd"
          : ""
      }`
    : "Please verify on-chain";

  // Icon for the link
  const verificationIcon = document.createElement("img");
  verificationIcon.src = iconSrcIfVerified(allVerified);
  verificationIcon.alt = allVerified ? "Verified icon" : "Warning icon";
  verificationIcon.style.width = "12px";
  verificationIcon.style.height = "10px";
  verificationIcon.style.marginRight = "5px";
  verificationLink.prepend(verificationIcon);

  // Tooltip container for hover menu
  const tooltipContainer = document.createElement("div");
  tooltipContainer.style.position = "absolute";
  tooltipContainer.style.backgroundColor = "#fff";
  tooltipContainer.style.border = "1px solid #ddd";
  tooltipContainer.style.borderRadius = "4px";
  tooltipContainer.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.2)";
  tooltipContainer.style.padding = "8px";
  tooltipContainer.style.marginTop = "4px";
  tooltipContainer.style.display = "none"; // Hidden by default
  tooltipContainer.style.zIndex = "100";
  tooltipContainer.style.minWidth = "200px";
  tooltipContainer.style.whiteSpace = "nowrap";

  // Populate the hover menu with verification links
  params.verifications.forEach((v) => {
    const verificationItem = document.createElement("div");
    verificationItem.style.display = "flex";
    verificationItem.style.justifyContent = "space-between";
    verificationItem.style.alignItems = "center";
    verificationItem.style.marginBottom = "4px"; // Add spacing between rows if needed

    const verificationLink = document.createElement("a");
    const label = v.url
      ? `${shortenAddress(v.contractAddress)} on ${
          v.chainName ?? "chain id " + v.chainId
        }`
      : `Contract ${v.contractAddress} on chain with id: ${v.chainId}, `;

    verificationLink.textContent = label;
    verificationLink.href = v.url ?? "#";
    verificationLink.style.color = v.isOwnershipVerified
      ? "#4a63e7"
      : "#d8a200";
    verificationLink.target = "_blank";
    verificationLink.style.fontSize = "10px";
    verificationLink.style.textDecoration = "none";
    verificationLink.style.flexGrow = "1"; // Ensure the link takes up available space

    const verificationIcon = document.createElement("img");
    verificationIcon.src = iconSrcIfVerified(v.isOwnershipVerified);
    verificationIcon.alt = v.isOwnershipVerified
      ? "Verified icon"
      : "Warning icon";
    verificationIcon.style.width = "12px";
    verificationIcon.style.height = "10px";

    // Append link and icon to the row
    verificationItem.appendChild(verificationLink);
    verificationItem.appendChild(verificationIcon);

    // Add the row to the tooltip container
    tooltipContainer.appendChild(verificationItem);
  });

  // Add hover events to ensure menu remains visible when moving between elements
  let isHovering = false;

  const showTooltip = () => {
    tooltipContainer.style.display = "block";
  };

  const hideTooltip = () => {
    if (!isHovering) {
      tooltipContainer.style.display = "none";
    }
  };

  verificationContainer.addEventListener("mouseenter", () => {
    isHovering = true;
    showTooltip();

    // Check for viewport overflow and adjust position
    const rect = tooltipContainer.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    if (rect.bottom > viewportHeight) {
      tooltipContainer.style.marginTop = `-${rect.height + 8}px`; // Open upward
    } else {
      tooltipContainer.style.marginTop = "4px"; // Default downward
    }
  });

  verificationContainer.addEventListener("mouseleave", () => {
    isHovering = false;
    setTimeout(hideTooltip, 200); // Delay hiding to allow mouse to move to the menu
  });

  tooltipContainer.addEventListener("mouseenter", () => {
    isHovering = true;
    showTooltip();
  });

  tooltipContainer.addEventListener("mouseleave", () => {
    isHovering = false;
    setTimeout(hideTooltip, 200); // Delay hiding to allow mouse to move back to the link
  });

  // Assemble the components
  verificationContainer.appendChild(verificationLink);
  verificationContainer.appendChild(tooltipContainer);

  // Assemble the text container
  textContainer.appendChild(title);
  textContainer.appendChild(subtitle);
  textContainer.appendChild(verificationContainer);

  // Assemble the notification
  notification.appendChild(iconContainer);
  notification.appendChild(textContainer);

  // Wrap in div
  const wrapper = document.createElement("div");
  wrapper.appendChild(notification);

  return wrapper;

  return notification;
};
