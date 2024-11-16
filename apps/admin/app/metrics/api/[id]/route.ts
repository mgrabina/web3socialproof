// pages/api/metrics/[id].ts
import { NextRequest, NextResponse } from "next/server";
import { db, metricsTable, eq } from "@web3socialproof/db";
import { getUserProtocol } from "@/utils/database/users";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const { name, description, calculation_type, enabled } = await req.json();

  const protocol = await getUserProtocol();

  if (!protocol) {
    return NextResponse.json(
      { error: "No protocol found for the user." },
      { status: 404 }
    );
  }

  const metricInDb = await db
    .select()
    .from(metricsTable)
    .where(eq(metricsTable.id, Number(id)));

  if (metricInDb.length === 0) {
    return NextResponse.json({ error: "Metric not found." }, { status: 404 });
  }

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
        name,
        description,
        calculation_type,
        enabled,
        updated_at: new Date().toISOString(),
      })
      .where(eq(metricsTable.id, Number(id)));

    return NextResponse.json(updatedMetric, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update the metric." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const protocol = await getUserProtocol();

  if (!protocol) {
    return NextResponse.json(
      { error: "No protocol found for the user." },
      { status: 404 }
    );
  }

  const metricInDb = await db
    .select()
    .from(metricsTable)
    .where(eq(metricsTable.id, Number(id)));

  if (metricInDb.length === 0) {
    return NextResponse.json({ error: "Metric not found." }, { status: 404 });
  }

  if (metricInDb[0].protocol_id !== protocol.id) {
    return NextResponse.json(
      { error: "Metric not found for the user." },
      { status: 404 }
    );
  }

  try {
    await db.delete(metricsTable).where(eq(metricsTable.id, Number(id)));
    return NextResponse.json({}, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete the metric." },
      { status: 500 }
    );
  }
}
