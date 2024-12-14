import { TRPCError } from "@trpc/server";
import {
  and,
  db,
  eq,
  experimentsTable,
  SelectProtocol,
  variantsPerExperimentTable,
  variantsTable,
} from "@web3socialproof/db";
import {
  isIconName,
  NotificationOptions,
  NotificationStylingOptional,
} from "@web3socialproof/shared/constants";

export const getExperimentVariant = async ({
  hostname,
  protocol,
}: {
  hostname: string;
  protocol: SelectProtocol;
}): Promise<NotificationOptions | undefined> => {
  if (!protocol || !protocol.plan) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Protocol not found or doesn't have a plan.",
    });
  }

  // Check if there are experiments
  let experiments = await db
    .select()
    .from(experimentsTable)
    .where(
      and(
        eq(experimentsTable.protocol_id, protocol.id),
        eq(experimentsTable.enabled, true)
      )
    );

  // Validate Hosts
  experiments = experiments.filter((experiment) => {
    if (!experiment.hostnames?.length) {
      // Allow all hosts
      return true;
    }

    return experiment.hostnames?.includes(hostname);
  });

  if (experiments.length === 0) {
    return undefined;
  }

  // Select Experiment aleatory from available experiments
  const experiment =
    experiments[Math.floor(Math.random() * experiments.length)];

  // Get Experiment Variants
  let variantsWithPercentages = await db
    .select()
    .from(variantsPerExperimentTable)
    .where(eq(variantsPerExperimentTable.experiment_id, experiment.id));

  // Select Variant aleatory based on percentages of each variant
  const totalPercentage = variantsWithPercentages.reduce(
    (acc, variant) => acc + variant.percentage,
    0
  );
  const randomPercentage = Math.floor(Math.random() * totalPercentage);
  let currentPercentage = 0;
  let selectedVariant = variantsWithPercentages[0];

  // Select the variant based on the random number
  let cumulativePercentage = 0;
  for (const variant of variantsWithPercentages) {
    cumulativePercentage += variant.percentage;
    if (randomPercentage < cumulativePercentage) {
      selectedVariant = variant;
      break;
    }
  }
  if (!selectedVariant) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Could not choose variant.",
    });
  }

  if (!selectedVariant.variant_id) {
    // No variant selected - testing without herd mode
    // todo check
    return undefined;
  }

  // Get Variant Details
  const variant = await db
    .select()
    .from(variantsTable)
    .where(eq(variantsTable.id, selectedVariant.variant_id))
    .limit(1);

  const variantToPrint = variant[0];

  if (!variantToPrint) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Could not find variant.",
    });
  }

  return {
    styling: variantToPrint.styling as NotificationStylingOptional,
    message: variantToPrint.message,
    iconName:
      variantToPrint.iconName && isIconName(variantToPrint.iconName)
        ? variantToPrint.iconName
        : undefined,
    iconSrc: variantToPrint.iconSrc ?? undefined,
    delay: variantToPrint.delay ?? undefined,
    timer: variantToPrint.timer ?? undefined,
    subMessage: variantToPrint.sub_message ?? "",
    variantId: variantToPrint.id,
    experimentId: experiment.id,
    subscriptionPlan: protocol.plan,
    pathnames: experiment.pathnames ?? undefined,
  };
};
