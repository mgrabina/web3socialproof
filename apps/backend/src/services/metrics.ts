import {
  db,
  eq,
  inArray,
  logsTable,
  metricsTable,
  metricsVariablesTable,
} from "@web3socialproof/db";

export const getMetricValue = async (metric: string) => {
  const metrics = await db
    .select()
    .from(metricsTable)
    .where(eq(metricsTable.name, metric));

  if (metrics.length === 0) {
    return undefined;
  }

  const metricVariables = await db
    .select()
    .from(metricsVariablesTable)
    .where(eq(metricsVariablesTable.metric_id, metrics[0].id));

  const logs = await db
    .select()
    .from(logsTable)
    .where(
      inArray(
        logsTable.id,
        metricVariables.map((v) => v.variable_id)
      )
    );

  const result = logs.reduce((acc, log) => {
    return acc + (log.current_result ?? 0n);
  }, 0n);

  return result;
};
