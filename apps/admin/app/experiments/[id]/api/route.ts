import { VariantDetailsResults } from "@/components/ExperimentDetail";
import { getUserProtocol } from "@/utils/database/users";
import {
  and,
  conversionsTable,
  db,
  eq,
  gte,
  impressionsTable,
  sql,
  variantsTable,
} from "@web3socialproof/db";
import dayjs from "dayjs";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  try {
    const protocol = await getUserProtocol();
    if (!protocol) {
      return NextResponse.json(
        { error: "No protocol found for the user." },
        { status: 404 }
      );
    }

    const protocolId = protocol.id;

    // Fetch daily impressions for the last 30 days
    const startDate = dayjs().subtract(30, "days").format("YYYY-MM-DD");
    const dailyImpressions = await db
      .select({
        variantId: impressionsTable.variant_id,
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
          eq(impressionsTable.experiment_id, Number(id)),
          gte(impressionsTable.timestamp, startDate)
        )
      )
      .groupBy(
        impressionsTable.variant_id,
        sql`date(impressions_table.timestamp)`
      )
      .orderBy(
        impressionsTable.variant_id,
        sql`date(impressions_table.timestamp)`
      );

    const dailyConversions = await db
      .select({
        variantId: conversionsTable.variant_id,
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
          eq(conversionsTable.experiment_id, Number(id)),
          gte(conversionsTable.timestamp, startDate)
        )
      )
      .groupBy(
        conversionsTable.variant_id,
        sql`date(conversions_table.timestamp)`
      )
      .orderBy(
        conversionsTable.variant_id,
        sql`date(conversions_table.timestamp)`
      );

    let variantsResults: Record<string, VariantDetailsResults> = {};

    variantsResults = dailyImpressions.reduce((acc, { variantId, date, count }) => {
      const idx = variantId ?? "empty";
      if (!acc[idx]) {
        acc[idx] = {
          totalImpressions: 0,
          totalConversions: 0,
          dailyImpressions: [],
          dailyConversions: [],
        };
      }

      acc[idx].totalImpressions += Number(count);
      acc[idx].dailyImpressions.push({
        date: String(date),
        count: Number(count),
      });
      return acc;
    }, variantsResults);

    variantsResults = dailyConversions.reduce((acc, { variantId, date, count }) => {
      const idx = variantId ?? "empty";
      if (!acc[idx]) {
        acc[idx] = {
          totalImpressions: 0,
          totalConversions: 0,
          dailyImpressions: [],
          dailyConversions: [],
        };
      }

      acc[idx].totalConversions += Number(count);
      acc[idx].dailyConversions.push({
        date: String(date),
        count: Number(count),
      });
      return acc;
    }, variantsResults);

    const dataKeys = Object.keys(variantsResults);
    const totalImpressions = dataKeys.reduce(
      (acc, key) => acc + variantsResults[key].totalImpressions,
      0
    );
    const totalConversions = dataKeys.reduce(
      (acc, key) => acc + variantsResults[key].totalConversions,
      0
    );

    return NextResponse.json({
      totalImpressions,
      totalConversions,
      variantsResults,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data." },
      { status: 500 }
    );
  }
}
