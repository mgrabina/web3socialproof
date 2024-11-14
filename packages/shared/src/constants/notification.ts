import { z } from "zod";

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
  styling: notificationStylingSchemaOptional,
});
export type NotificationOptions = z.infer<typeof notificationOptionsSchema>;

export const notificationResponseSchema = z.object({
  campaign: z.number(),
  type: notificationTypeSchema,
  icon: z.string(),
  message: z.string(),
  subMessage: z.string(),
  verificationLink: z.string(),
  styling: notificationStylingSchemaRequired,
});
export type NotificationResponse = z.infer<typeof notificationResponseSchema>;

// Function to style {{METRIC}} placeholders
function renderTextWithMetricStyles(
  text: string,
  baseColor: string,
  availableMetricNames: Set<string>
): HTMLDivElement {
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
  const verifiedLink = document.createElement("a");
  verifiedLink.href = params.verificationLink;
  verifiedLink.target = "_blank";
  verifiedLink.textContent = "Verified on-chain by Herd";
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

  // Wrap in div
  const wrapper = document.createElement("div");
  wrapper.appendChild(notification);

  return wrapper;

  return notification;
};
