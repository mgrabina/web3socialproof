import { getUserProtocol } from "@/utils/database/users";
import { db, eq, metricsTable } from "@web3socialproof/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  // Validate protocol
  const protocol = await getUserProtocol();
  if (!protocol) {
    return NextResponse.json(
      { error: "No protocol found for the user." },
      { status: 404 }
    );
  }

  // Check if metric exists
  const metricInDb = await db
    .select()
    .from(metricsTable)
    .where(eq(metricsTable.id, Number(id)));
  if (metricInDb.length === 0) {
    return NextResponse.json({ error: "Metric not found." }, { status: 404 });
  }

  // Check if the metric belongs to the user's protocol
  if (metricInDb[0].protocol_id !== protocol.id) {
    return NextResponse.json(
      { error: "Metric not found for the user." },
      { status: 404 }
    );
  }

  try {
    const updatedMetric = await db
      .update(metricsTable)
      .set({
        enabled: true,
      })
      .where(eq(metricsTable.id, Number(id)));

    return NextResponse.json(updatedMetric, { status: 200 });
  } catch (error) {
    console.error("Error updating metric:", error);
    return NextResponse.json(
      { error: "Failed to update the metric." },
      { status: 500 }
    );
  }
}
