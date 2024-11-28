import { saveConversionInDb } from "../sources/database";

export const trackConversion = async (input: {
  protocol: number;
  campaignId?: number;
  session: string;
  user: string;
  hostname?: string;
  pathname?: string;
  elementId?: string;
}) => {
  await saveConversionInDb({
    protocolId: input.protocol,
    campaignId: input.campaignId,
    user: input.user,
    session: input.session,
    hostname: input.hostname,
    pathname: input.pathname,
    elementId: input.elementId,
  });
};
