import { saveImpressionInDb } from "../sources/database";

export const trackImpression = async (input: {
  experimentId: number;
  variantId?: number;
  session: string;
  user: string;
  address?: string;
}) => {
  await saveImpressionInDb({
    experimentId: input.experimentId,
    variantId: input.variantId,
    address: input.address,
    session: input.session,
    user: input.user,
  });
};
