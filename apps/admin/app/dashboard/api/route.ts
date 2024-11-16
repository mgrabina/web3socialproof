import {
  db,
  campaignsTable,
  metricsTable,
  impressionsTable,
  eq,
  gte,
  count,
  sql,
  desc,
  metricsVariablesTable,
  logsTable,
  countDistinct,
  and,
} from "@web3socialproof/db";
import { NextRequest, NextResponse } from "next/server";
import dayjs from "dayjs";
import { getUserProtocol } from "@/utils/database/users";

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

    // Fetch total campaigns, metrics, and impressions
    const totalCampaigns = await db.$count(
      campaignsTable,
      eq(campaignsTable.protocol_id, protocolId)
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
          campaignsTable,
          eq(impressionsTable.campaign_id, campaignsTable.id)
        )
        .where(eq(campaignsTable.protocol_id, protocolId))
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
        campaignsTable,
        eq(impressionsTable.campaign_id, campaignsTable.id)
      )
      .where(
        and(
          eq(campaignsTable.protocol_id, protocolId),
          gte(impressionsTable.timestamp, startDate)
        )
      )
      .groupBy(sql`date(impressions_table.timestamp)`) // Group by the date part
      .orderBy(sql`date(impressions_table.timestamp)`); // Ensure proper ordering

    return NextResponse.json({
      totalCampaigns: totalCampaigns,
      totalMetrics: totalMetrics,
      totalImpressions: totalImpressions,
      dailyImpressions,
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
