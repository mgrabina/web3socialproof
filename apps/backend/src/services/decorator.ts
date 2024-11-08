import {
  NotificationOptions,
  NotificationResponse,
  NotificationStylingRequired,
  NotificationType,
} from "../constant/notification";

export const defaultStyling: NotificationStylingRequired = {
  fontFamily: "Arial, sans-serif",
  titleColor: "#333",
  subtitleColor: "#888",
  borderRadius: "100px",
  backgroundColor: "white",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
};

const icons: Record<NotificationType, URL> = {
  walletsConnected: new URL(
    "https://img.icons8.com/ios-glyphs/30/fa314a/fire-element.png"
  ),
  swaps: new URL(
    "https://img.icons8.com/ios-glyphs/30/fa314a/fire-element.png"
  ),
  TVL: new URL("https://img.icons8.com/ios-glyphs/30/fa314a/fire-element.png"),
};

export const decorateNotification = (
  options: NotificationOptions
): NotificationResponse => {
  // Prioritize user configured styling
  const styling = {
    ...defaultStyling,
    ...options.styling,
  };

  // Todo: add translation if needed

  return {
    type: options.type,
    icon: "🎉",
    verificationLink: "https://talaria.com",
    message: "Notification decorated in backend!",
    subMessage: "This is a sub message",
    styling,
  };
};
