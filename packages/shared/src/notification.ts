import {
  NotificationResponse,
  PreviewConfig,
  defaultPreviewConfig,
  defaultStyling,
  iconsSvgs,
  isIconName,
  notificationId,
  positions,
  responsiveStyling,
} from "./constants";
import { isMobile, renderTextWithMetricStyles, shortenAddress } from "./utils";

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
