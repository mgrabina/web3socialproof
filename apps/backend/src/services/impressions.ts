import { getCampaign, saveImpressionInDb } from "../sources/database";

export const trackImpression = async (input: {
  campaignId: number;
  session: string;
  user: string;
  address?: string;
}) => {
  const campaign = await getCampaign(input.campaignId);

  await saveImpressionInDb({
    campaign,
    address: input.address,
    session: input.session,
    user: input.user,
  });
};
