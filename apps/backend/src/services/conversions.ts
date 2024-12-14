import { saveConversionInDb } from "../sources/database";

export const trackConversion = async (input: {
  protocol: number;
  experimentId: number;
  variantId?: number;
  session: string;
  user: string;
  hostname?: string;
  pathname?: string;
  elementId?: string;
}) => {
  await saveConversionInDb({
    protocolId: input.protocol,
    experimentId: input.experimentId,
    variantId: input.variantId,
    user: input.user,
    session: input.session,
    hostname: input.hostname,
    pathname: input.pathname,
    elementId: input.elementId,
  });
};
