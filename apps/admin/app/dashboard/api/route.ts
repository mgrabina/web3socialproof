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
      dailyImpressions,
      dailyConversions,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data." },
      { status: 500 }
    );
  }
}
