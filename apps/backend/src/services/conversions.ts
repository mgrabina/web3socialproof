import { saveConversionInDb } from "../sources/database";

export const trackConversion = async (input: {
  protocol: number;
  variantId?: number;
  session: string;
  user: string;
  hostname?: string;
  pathname?: string;
  elementId?: string;
}) => {
  await saveConversionInDb({
    protocolId: input.protocol,
    variantId: input.variantId,
    user: input.user,
    session: input.session,
    hostname: input.hostname,
    pathname: input.pathname,
    elementId: input.elementId,
  });
};
