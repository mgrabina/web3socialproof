import {
  defaultStyling,
  NotificationOptions,
  NotificationResponse,
  NotificationStylingRequired,
  NotificationType,
  VerificationInfo,
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
  if (!matches)
    return {
      str,
      verifications: [],
    };

  const verificationsAgg: VerificationInfo[] = [];

  for (const match of matches) {
    const metric = match.slice(1, -1); // Remove the curly braces
    const metricInfo = await getMetricValue(metric);

    metricInfo?.verifications.forEach(
      (verification) =>
        !verificationsAgg.includes(verification) &&
        verificationsAgg.push(verification)
    );
    const replacement = metricInfo?.value?.toString() ?? match;

    str = str.replace(match, replacement);
  }

  return {
    str,
    verifications: verificationsAgg,
  };
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

  const messageReplaced = await replaceMetricsInString(options.message);
  const subMessageReplaced = await replaceMetricsInString(options.subMessage);

  return {
    campaign: options.campaign,
    type: options.type,
    message: messageReplaced.str,
    subMessage: subMessageReplaced.str,
    iconName: options.iconName,
    iconSrc: options.iconSrc,
    delay: options.delay,
    timer: options.timer,
    styling,
    verifications: [
      ...messageReplaced.verifications,
      ...subMessageReplaced.verifications,
    ],
    subscriptionPlan: options.subscriptionPlan,
    pathnames: options.pathnames,
  };
};
