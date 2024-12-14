import { getUserProtocol } from "@/utils/database/users";
import {
  and,
  conversionsTable,
  db,
  desc,
  eq,
  gte,
  impressionsTable,
  logsTable,
  metricsTable,
  metricsVariablesTable,
  sql,
  variantsTable,
} from "@web3socialproof/db";
import dayjs from "dayjs";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const protocol = await getUserProtocol();
    if (!protocol) {
      return NextResponse.json(
        { error: "No protocol found for the user." },
        { status: 404 }
      );
    }

    const protocolId = protocol.id;

    // Fetch total variants, metrics, and impressions
    const totalVariants = await db.$count(
      variantsTable,
      eq(variantsTable.protocol_id, protocolId)
    );
    const totalMetrics = await db.$count(
      metricsTable,
      eq(metricsTable.protocol_id, protocolId)
    );

    const totalImpressions = await db.$count(
      db
        .select()
        .from(impressionsTable)
        .fullJoin(
          variantsTable,
          eq(impressionsTable.variant_id, variantsTable.id)
        )
        .where(eq(variantsTable.protocol_id, protocolId))
        .as("subquery")
    );

    const totalConversions = await db.$count(
      db
        .select()
        .from(conversionsTable)
        .where(eq(conversionsTable.protocol_id, protocolId))
        .as("subquery")
    );

    // return most impressive metric
    const mostImpressiveMetric = await db
      .select({
        metric_id: metricsTable.id,
        metric_name: metricsTable.name,
        total_value: sql`SUM(${logsTable.current_result})`.as("total_value"),
      })
      .from(metricsTable)
      .leftJoin(
        metricsVariablesTable,
        eq(metricsTable.id, metricsVariablesTable.metric_id)
      )
      .leftJoin(logsTable, eq(metricsVariablesTable.variable_id, logsTable.id))
      .where(eq(metricsTable.protocol_id, protocolId))
      .groupBy(metricsTable.id, metricsTable.name)
      .orderBy(desc(sql`SUM(${logsTable.current_result})`))
      .limit(1); // Get only the most impressive metric

    // Fetch daily impressions for the last 30 days
    const startDate = dayjs().subtract(30, "days").format("YYYY-MM-DD");
    const dailyImpressions = await db
      .select({
        date: sql`date(impressions_table.timestamp)`.as("date"),
        count: sql`COUNT(DISTINCT ${impressionsTable.id})`.as("count"),
      })
      .from(impressionsTable)
      .leftJoin(
        variantsTable,
        eq(impressionsTable.variant_id, variantsTable.id)
      )
      .where(
        and(
          eq(variantsTable.protocol_id, protocolId),
          gte(impressionsTable.timestamp, startDate)
        )
      )
      .groupBy(sql`date(impressions_table.timestamp)`) // Group by the date part
      .orderBy(sql`date(impressions_table.timestamp)`); // Ensure proper ordering

    const dailyConversions = await db
      .select({
        date: sql`date(conversions_table.timestamp)`.as("date"),
        count: sql`COUNT(DISTINCT ${conversionsTable.id})`.as("count"),
      })
      .from(conversionsTable)
      .leftJoin(
        variantsTable,
        eq(conversionsTable.variant_id, variantsTable.id)
      )
      .where(
        and(
          eq(variantsTable.protocol_id, protocolId),
          gte(conversionsTable.timestamp, startDate)
        )
      )
      .groupBy(sql`date(conversions_table.timestamp)`) // Group by the date part
      .orderBy(sql`date(conversions_table.timestamp)`); // Ensure proper ordering

    return NextResponse.json({
      totalVariants: totalVariants,
      totalMetrics: totalMetrics,
      totalImpressions: totalImpressions,
      totalConversions: totalConversions,
      dailyImpressions,
      dailyConversions,
      mostImpressiveMetric:
        mostImpressiveMetric.length === 0
          ? undefined
          : {
              name: mostImpressiveMetric[0].metric_name,
              value: mostImpressiveMetric[0].total_value,
            },
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data." },
      { status: 500 }
    );
  }
}
