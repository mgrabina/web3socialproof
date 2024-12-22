import { saveImpressionInDb } from "../sources/database";

export const trackImpression = async (input: {
  protocolId: number;
  experimentId: number;
  variantId?: number;
  session: string;
  user: string;
  address?: string;
}) => {
  await saveImpressionInDb({
    protocolId: input.protocolId,
    experimentId: input.experimentId,
    variantId: input.variantId,
    address: input.address,
    session: input.session,
    user: input.user,
  });
};
