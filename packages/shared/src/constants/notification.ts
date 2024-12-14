import { z } from "zod";
import { shortenAddress } from "../utils/evm";

export const notificationTypeSchema = z.union([
  z.literal("swaps"),
  z.literal("TVL"),
  z.literal("walletsConnected"),
]);
export type NotificationType = z.infer<typeof notificationTypeSchema>;

export const DestkopPositions = [
  "bottom-right",
  "bottom-left",
  "top-right",
  "top-left",
] as const;
export type DesktopPosition = (typeof DestkopPositions)[number];
export const MobilePositions = [
  "center",
  "bottom-center",
  "top-center",
  "none",
] as const;
export type MobilePosition = (typeof MobilePositions)[number];
export type Position = DesktopPosition | MobilePosition;

export const iconNames = ["flame", "growth", "checked", "money"] as const;
export type IconName = (typeof iconNames)[number];
export const isIconName = (name: string): name is IconName =>
  iconNames.includes(name as IconName);

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
  mobilePosition: z.enum(MobilePositions).optional(),
  desktopPosition: z.enum(DestkopPositions).optional(),
});

// Required schema where all fields are strictly required
export const notificationStylingSchemaRequired = z.object({
  fontFamily: z.string(),
  titleColor: z.string(),
  subtitleColor: z.string(),
  backgroundColor: z.string(),
  iconBackgroundColor: z.string(),
  iconBorderRadius: z.string(),
  iconColor: z.string(),
  borderRadius: z.string(),
  border: z.string(),
  boxShadow: z.string(),
  mobilePosition: z.enum(MobilePositions),
  desktopPosition: z.enum(DestkopPositions),
  showClosingButton: z.boolean(),
  showIcon: z.boolean(),
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
  iconBorderRadius: "50%",
  backgroundColor: "#ffffff",
  iconBackgroundColor: "#FF6347",
  iconColor: "#ffffff",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  mobilePosition: "bottom-center",
  desktopPosition: "bottom-left",
  showClosingButton: false,
  showIcon: true,
};

export const notificationOptionsSchema = z.object({
  campaign: z.number(),
  type: notificationTypeSchema,
  message: z.string(),
  subMessage: z.string(),
  iconName: z.enum(iconNames).optional(),
  iconSrc: z.string().optional(),
  delay: z.number().optional(),
  timer: z.number().optional(),
  verificationLink: z.string(),
  subscriptionPlan: z.string(),
  styling: notificationStylingSchemaOptional,
  pathnames: z.array(z.string()).optional(),
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
  iconName: z.enum(iconNames).optional(),
  iconSrc: z.string().optional(),
  delay: z.number().optional(),
  timer: z.number().optional(),
  message: z.string(),
  subMessage: z.string(),
  verifications: z.array(verificationInfoSchema),
  styling: notificationStylingSchemaRequired,
  subscriptionPlan: z.string(),
  pathnames: z.array(z.string()).optional(),
});
export type NotificationResponse = z.infer<typeof notificationResponseSchema>;

// Function to style {{METRIC}} placeholders
function renderTextWithMetricStyles(
  text: string,
  baseColor: string,
  availableMetricNames: Set<string>,
  fontSize: string,
  fontWeight: string
): HTMLDivElement {
  if (
    !availableMetricNames.size ||
    !text ||
    !text.includes("{") ||
    !text.includes("}")
  ) {
    const span = document.createElement("div");
    span.textContent = text;
    span.style.fontSize = fontSize;
    span.style.fontWeight = fontWeight;
    span.style.color = baseColor;

    return span;
  }

  const container = document.createElement("div");
  container.style.fontSize = fontSize;
  const regex = /{(.*?)}/g;
  const parts = text.split(regex);

  parts.forEach((part, index) => {
    if (index % 2 === 1) {
      // This is a placeholder (e.g., {METRIC})
      const isValidMetric = availableMetricNames?.has(part);
      const span = document.createElement("span");
      span.textContent = isValidMetric ? "3.5k" : `{${part}}`;
      span.style.color = isValidMetric ? baseColor : "#FA7070";
      span.style.fontWeight = fontWeight;
      container.appendChild(span);
    } else {
      // Regular text
      const span = document.createElement("span");
      span.textContent = part;
      span.style.color = baseColor;
      span.style.fontWeight = fontWeight;
      container.appendChild(span);
    }
  });

  return container;
}

type IconAttributes = {
  viewBox?: string;
  width?: string;
  height?: string;
  color?: string;
};

export const createSvgIcon = (
  pathsArray: string[],
  attributes: IconAttributes = {}
): SVGElement | null => {
  if (typeof document === "undefined") {
    return null;
  }

  const {
    viewBox = "0 0 24 24",
    width = "24",
    height = "24",
    color = "currentColor",
  } = attributes;

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  svg.setAttribute("viewBox", viewBox);

  pathsArray.forEach((pathData) => {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", pathData);
    svg.appendChild(path);
  });

  return svg;
};

export const iconsSvgs: Record<IconName, () => SVGElement | null> = {
  flame: () =>
    createSvgIcon(
      [
        "M216.02,611.195c5.978,3.178,12.284-3.704,8.624-9.4c-19.866-30.919-38.678-82.947-8.706-149.952 c49.982-111.737,80.396-169.609,80.396-169.609s16.177,67.536,60.029,127.585c42.205,57.793,65.306,130.478,28.064,191.029 c-3.495,5.683,2.668,12.388,8.607,9.349c46.1-23.582,97.806-70.885,103.64-165.017c2.151-28.764-1.075-69.034-17.206-119.851 c-20.741-64.406-46.239-94.459-60.992-107.365c-4.413-3.861-11.276-0.439-10.914,5.413c4.299,69.494-21.845,87.129-36.726,47.386 c-5.943-15.874-9.409-43.33-9.409-76.766c0-55.665-16.15-112.967-51.755-159.531c-9.259-12.109-20.093-23.424-32.523-33.073 c-4.5-3.494-11.023,0.018-10.611,5.7c2.734,37.736,0.257,145.885-94.624,275.089c-86.029,119.851-52.693,211.896-40.864,236.826 C153.666,566.767,185.212,594.814,216.02,611.195z",
      ],
      {
        viewBox: "0 0 611.999 611.999",
      }
    ),
  growth: () =>
    createSvgIcon(
      [
        "M20,8v2h6.5859L18,18.5859,13.707,14.293a.9994.9994,0,0,0-1.414,0L2,24.5859,3.4141,26,13,16.4141l4.293,4.2929a.9994.9994,0,0,0,1.414,0L28,11.4141V18h2V8Z",
      ],
      { viewBox: "0 0 32 32" }
    ),
  checked: () =>
    createSvgIcon(
      [
        "M6.53 9.02 4.58 7.07l-.88.89 2.83 2.83.88-.89 4.78-4.77-.89-.88-4.77 4.77z",
        "M8 .5A7.77 7.77 0 0 0 0 8a7.77 7.77 0 0 0 8 7.5A7.77 7.77 0 0 0 16 8 7.77 7.77 0 0 0 8 .5zm0 13.75A6.52 6.52 0 0 1 1.25 8 6.52 6.52 0 0 1 8 1.75 6.52 6.52 0 0 1 14.75 8 6.52 6.52 0 0 1 8 14.25z",
      ],
      { viewBox: "0 0 16 16" }
    ),
  money: () =>
    createSvgIcon(
      [
        "M12.32 8a3 3 0 0 0-2-.7H5.63A1.59 1.59 0 0 1 4 5.69a2 2 0 0 1 0-.25 1.59 1.59 0 0 1 1.63-1.33h4.62a1.59 1.59 0 0 1 1.57 1.33h1.5a3.08 3.08 0 0 0-3.07-2.83H8.67V.31H7.42v2.3H5.63a3.08 3.08 0 0 0-3.07 2.83 2.09 2.09 0 0 0 0 .25 3.07 3.07 0 0 0 3.07 3.07h4.74A1.59 1.59 0 0 1 12 10.35a1.86 1.86 0 0 1 0 .34 1.59 1.59 0 0 1-1.55 1.24h-4.7a1.59 1.59 0 0 1-1.55-1.24H2.69a3.08 3.08 0 0 0 3.06 2.73h1.67v2.27h1.25v-2.27h1.7a3.08 3.08 0 0 0 3.06-2.73v-.34A3.06 3.06 0 0 0 12.32 8z",
      ],
      { viewBox: "0 0 16 16" }
    ),
};

// Define all positions with their CSS styles
const positions: Record<Position, Partial<CSSStyleDeclaration>> = {
  "bottom-right": { bottom: "20px", right: "20px" },
  "bottom-left": { bottom: "20px", left: "20px" },
  "top-right": { top: "20px", right: "20px" },
  "top-left": { top: "20px", left: "20px" },
  center: { top: "50%", left: "50%", transform: "translate(-50%, -50%)" },
  "bottom-center": {
    bottom: "20px",
    left: "50%",
    transform: "translateX(-50%)",
  },
  "top-center": { top: "20px", left: "50%", transform: "translateX(-50%)" },
  none: {},
};

export const isMobile = () => window.innerWidth < 768;

const responsiveStyling = {
  mobile: {
    position: "bottom-center",
    titleFontSize: "16px",
    subtitleFontSize: "11px",
    verificationFontSize: "9px",
    width: "400px",
    height: "100px",
    padding: "15px",
    iconContainerWidth: "65px",
    iconContainerHeight: "65px",
    iconWidth: "20px",
    iconHeight: "20px",
    closeButtonMargin: "3em",
  },
  desktop: {
    titleFontSize: "18px",
    subtitleFontSize: "13px",
    verificationFontSize: "11px",
    width: "400px",
    height: "120px",
    padding: "20px",
    iconContainerWidth: "80px",
    iconContainerHeight: "80px",
    iconWidth: "24px",
    iconHeight: "24px",
    closeButtonMargin: "3em",
  },
};

type PreviewConfig = {
  isPreview: boolean;
  isMobilePreview: boolean;
  isVerifiedPreview: boolean;
  previewMetrics: Set<string>;
};
const defaultPreviewConfig = {
  isPreview: false,
  isMobilePreview: false,
  isVerifiedPreview: false,
  previewMetrics: new Set<string>(),
};

export const createNotification = (
  params: NotificationResponse,
  previewConfigs: Partial<PreviewConfig> = defaultPreviewConfig
): HTMLElement | null => {
  if (typeof document === "undefined") {
    return null;
  }
  const { isPreview, isMobilePreview, isVerifiedPreview, previewMetrics } = {
    ...defaultPreviewConfig,
    ...previewConfigs,
  };

  const responsiveStyles =
    isMobilePreview || isMobile()
      ? responsiveStyling.mobile
      : responsiveStyling.desktop;

  const notification = document.createElement("div");
  notification.style.display = "flex";
  notification.style.alignItems = "center";
  notification.style.padding = responsiveStyles.padding;
  // notification.style.overflow = "hidden";
  notification.style.border = params.styling.border || defaultStyling.border;
  notification.style.borderRadius =
    params.styling.borderRadius || defaultStyling.borderRadius;
  notification.style.backgroundColor =
    params.styling.backgroundColor || defaultStyling.backgroundColor;
  notification.style.boxShadow =
    params.styling.boxShadow || defaultStyling.boxShadow;
  notification.style.minWidth = responsiveStyles.width;
  // notification.style.height = responsiveStyles.height;
  notification.style.fontFamily =
    params.styling.fontFamily || defaultStyling.fontFamily;

  if (isPreview) {
    notification.style.position = "relative";
  } else {
    // Production
    notification.style.position = "fixed";
    notification.style.zIndex = "999";

    if (isMobile()) {
      if (params.styling.mobilePosition !== "none") {
        Object.assign(
          notification.style,
          positions[params.styling.mobilePosition]
        );
      }
    } else {
      Object.assign(
        notification.style,
        positions[params.styling.desktopPosition]
      );
    }
  }

  // Close button
  const closeButton = document.createElement("button");
  closeButton.textContent = "✕";
  closeButton.style.position = "absolute";
  closeButton.style.top = "50%";
  closeButton.style.right = responsiveStyles.closeButtonMargin;
  closeButton.style.transform = "translateY(-50%)";
  closeButton.style.background = "none";
  closeButton.style.border = "none";
  closeButton.style.cursor = "pointer";
  closeButton.style.fontSize = responsiveStyles.subtitleFontSize;
  closeButton.style.color = "#888";
  closeButton.style.transition = "color 0.2s ease, transform 0.2s ease"; // Smooth transitions

  // Hover styles
  closeButton.addEventListener("mouseenter", () => {
    closeButton.style.color = "#FA7070"; // Darker color on hover
    closeButton.style.transform = "translateY(-50%) scale(1.5)"; // Slightly enlarge
  });

  closeButton.addEventListener("mouseleave", () => {
    closeButton.style.color = "#888"; // Original color
    closeButton.style.transform = "translateY(-50%) scale(1)"; // Reset size
  });

  // Add close functionality
  closeButton.addEventListener("click", () => {
    if (!previewConfigs.isPreview) notification.remove();
  });

  // Icon container
  const iconContainer = document.createElement("div");
  iconContainer.style.width = responsiveStyles.iconContainerWidth;
  iconContainer.style.height = responsiveStyles.iconContainerHeight;
  iconContainer.style.backgroundColor =
    params.styling.iconBackgroundColor || defaultStyling.iconBackgroundColor;
  iconContainer.style.borderRadius = params.styling.iconBorderRadius;
  iconContainer.style.display = "flex";
  iconContainer.style.alignItems = "center";
  iconContainer.style.justifyContent = "center";

  // Icon
  let icon;
  if (params.iconSrc) {
    icon = document.createElement("img");
    icon.src = params.iconSrc || "https://www.svgrepo.com/show/13210/flame.svg";
    icon.alt = "Notification Icon";
  } else if (params.iconName && isIconName(params.iconName)) {
    icon = iconsSvgs[params.iconName]();
    if (icon) {
      icon.style.fill = params.styling.iconColor || defaultStyling.iconColor;
      icon.style.color = params.styling.iconColor || defaultStyling.iconColor;
    }
  } else {
    // Default icon
    icon = iconsSvgs.flame();
    if (icon) {
      icon.style.fill = params.styling.iconColor || defaultStyling.iconColor;
      icon.style.color = params.styling.iconColor || defaultStyling.iconColor;
    }
  }
  if (icon) {
    icon.style.width = responsiveStyles.iconWidth;
    icon.style.height = responsiveStyles.iconHeight;

    iconContainer.appendChild(icon);
  }

  // Text container
  const textContainer = document.createElement("div");
  textContainer.style.overflowX = "hidden";
  textContainer.style.wordBreak = "break-word";
  textContainer.style.overflowY = "scroll";
  textContainer.style.paddingLeft = params.styling.showIcon ? "1em" : "0";
  textContainer.style.marginLeft = params.styling.showIcon ? "0" : "2em";
  // textContainer.style.width = "80%";
  textContainer.style.maxHeight = "-webkit-fill-available";

  // Title
  let title;
  if (previewMetrics.size)
    title = renderTextWithMetricStyles(
      params.message,
      params.styling.titleColor,
      previewMetrics,
      responsiveStyles.titleFontSize,
      "bold"
    );
  else {
    title = document.createElement("p");
    title.textContent = params.message;
    title.style.fontSize = responsiveStyles.titleFontSize;
    title.style.fontWeight = "bold";
    title.style.color = params.styling.titleColor;
    title.style.margin = "0";
  }

  // Subtitle
  let subtitle;
  if (previewMetrics.size)
    subtitle = renderTextWithMetricStyles(
      params.subMessage,
      params.styling.subtitleColor,
      previewMetrics,
      responsiveStyles.subtitleFontSize,
      "normal"
    );
  else {
    subtitle = document.createElement("p");
    subtitle.textContent = params.subMessage;
    subtitle.style.fontSize = responsiveStyles.subtitleFontSize;
    subtitle.style.color = params.styling.subtitleColor;
    subtitle.style.margin = "3px 0 0 0";
  }

  // Verified link
  // Create the container for the verification message
  const verificationContainer = document.createElement("div");
  verificationContainer.style.position = "relative";
  verificationContainer.style.display = "inline-block";

  // Determine if all verifications are ownership verified
  const allVerified = isVerifiedPreview
    ? true
    : params.verifications.every((v) => v.isOwnershipVerified);
  const textColor = allVerified ? "#4a63e7" : "#d8a200"; // Blue if verified, dark yellow otherwise
  const iconSrcIfVerified = (verified: boolean) =>
    verified
      ? "https://img.icons8.com/fluency/48/verified-badge.png"
      : "https://img.icons8.com/fluency/48/warning-shield.png"; // Different icons

  // Main link/button
  const verificationLink = document.createElement("label");
  verificationLink.style.color = textColor;
  verificationLink.style.fontSize = responsiveStyles.verificationFontSize;
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
    : "Verify on-chain";

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
  tooltipContainer.style.zIndex = "10000"; // Ensure it's above everything
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

  // TODO ; CHECK HOVERING NOT WORKING
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
    tooltipContainer.style.display = "block";

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
    tooltipContainer.style.display = "none";
    setTimeout(hideTooltip, 200); // Delay hiding to allow mouse to move to the menu
  });

  tooltipContainer.addEventListener("mouseenter", () => {
    isHovering = true;
    tooltipContainer.style.display = "block";
    showTooltip();
  });

  tooltipContainer.addEventListener("mouseleave", () => {
    isHovering = false;
    tooltipContainer.style.display = "none";
    setTimeout(hideTooltip, 200); // Delay hiding to allow mouse to move back to the link
  });

  // Assemble the components
  verificationContainer.appendChild(verificationLink);
  notification.appendChild(tooltipContainer);

  // Assemble the text container
  textContainer.appendChild(title);
  textContainer.appendChild(subtitle);
  if (params.verifications.length) {
    // Only add the verification container if there are verifications

    textContainer.appendChild(verificationContainer);
  }

  // Assemble the notification
  if (params.styling.showClosingButton) {
    notification.appendChild(closeButton);
  }

  if (params.styling.showIcon) {
    notification.appendChild(iconContainer);
  }

  notification.appendChild(textContainer);

  // Wrap in div
  const wrapper = document.createElement("div");
  wrapper.id = notificationId;
  wrapper.appendChild(notification);

  return wrapper;
};

export const notificationId = "herd-notification";
