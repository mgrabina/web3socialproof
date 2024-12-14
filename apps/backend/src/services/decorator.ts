import {
  defaultStyling,
  HerdNotificationType,
  NotificationOptions,
  VerificationInfo,
} from "@web3socialproof/shared/constants/notification";
import { getMetricValue } from "./metrics";

const replaceMetricsInString = async (str?: string) => {
  if (!str) return {
    str: "",
    verifications: [],
  };

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
  options?: NotificationOptions
): Promise<HerdNotificationType | undefined> => {
  if (!options) return undefined;

  if (!options.variantId) {
    return {
      subscriptionPlan: options.subscriptionPlan,
      experiment: {
        experimentId: options.experimentId,
        pathnames: options.pathnames,
      },
    };
  }

  // Prioritize user configured styling
  const styling = {
    ...defaultStyling,
    ...options.styling,
  };

  // Todo: add translation if needed

  const messageReplaced = await replaceMetricsInString(options.message);
  const subMessageReplaced = await replaceMetricsInString(options.subMessage);

  return {
    variant: {
      variantId: options.variantId,
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
    },
    experiment: {
      experimentId: options.experimentId,
      pathnames: options.pathnames,
    },
    subscriptionPlan: options.subscriptionPlan,
  };
};
