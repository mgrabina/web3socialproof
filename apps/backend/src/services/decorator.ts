import {
  defaultStyling,
  NotificationOptions,
  NotificationResponse,
  NotificationStylingRequired,
  NotificationType,
} from "@web3socialproof/shared/constants/notification";
import { getMetricValue } from "./metrics";

const icons: Record<NotificationType, URL> = {
  walletsConnected: new URL(
    "https://img.icons8.com/ios-glyphs/30/fa314a/fire-element.png"
  ),
  swaps: new URL(
    "https://img.icons8.com/ios-glyphs/30/fa314a/fire-element.png"
  ),
  TVL: new URL("https://img.icons8.com/ios-glyphs/30/fa314a/fire-element.png"),
};

const replaceMetricsInString = async (str: string) => {
  const matches = str.match(/{(.*?)}/g);
  if (!matches) return str;

  const replacements = await Promise.all(
    matches.map(async (match) => {
      const metric = match.slice(1, -1); // Remove the curly braces
      const value = await getMetricValue(metric);
      return value?.toString() ?? match;
    })
  );

  let result = str;
  matches.forEach((match, index) => {
    result = result.replace(match, replacements[index]);
  });

  return result;
};

export const decorateNotification = async (
  options: NotificationOptions
): Promise<NotificationResponse> => {
  // Prioritize user configured styling
  const styling = {
    ...defaultStyling,
    ...options.styling,
  };

  // Todo: add translation if needed

  const message = await replaceMetricsInString(options.message);
  const subMessage = await replaceMetricsInString(options.subMessage);

  return {
    campaign: options.campaign,
    type: options.type,
    icon: "https://static.thenounproject.com/png/1878140-200.png", // todo based on type
    verificationLink: options.verificationLink,
    message,
    subMessage,
    styling,
  };
};
