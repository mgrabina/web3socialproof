import { getVariant, saveImpressionInDb } from "../sources/database";

export const trackImpression = async (input: {
  variantId: number;
  session: string;
  user: string;
  address?: string;
}) => {
  const variant = await getVariant(input.variantId);

  await saveImpressionInDb({
    variant,
    address: input.address,
    session: input.session,
    user: input.user,
  });
};
