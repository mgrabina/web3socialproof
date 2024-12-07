// pages/api/metrics/[id].ts
import { NextRequest, NextResponse } from "next/server";
import {
  db,
  metricsTable,
  eq,
  logsTable,
  metricsVariablesTable,
  SelectMetric,
  SelectLog,
  inArray,
  InsertLog,
  InsertMetric,
} from "@web3socialproof/db";
import { getUserProtocol } from "@/utils/database/users";
import SuperJSON from "superjson";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const updates: {
    metric: InsertMetric;
    variables: InsertLog[];
  } = await req.json();

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

  // Validate updates
  const prohibitedFields = ["id"];
  const filteredUpdates: Partial<InsertMetric> = Object.keys(
    updates.metric
  ).reduce((acc, key) => {
    if (!prohibitedFields.includes(key)) {
      acc[key as keyof InsertMetric] = updates.metric[
        key as keyof InsertMetric
      ] as any;
    }
    return acc;
  }, {} as Partial<InsertMetric>);

  // Add timestamp for tracking updates
  filteredUpdates.updated_at = new Date().toISOString();

  try {
    // Update Variables
    const currentVariables = await db
      .select()
      .from(logsTable)
      .fullJoin(
        metricsVariablesTable,
        eq(logsTable.id, metricsVariablesTable.variable_id)
      )
      .where(eq(metricsVariablesTable.metric_id, Number(id)));

    const variablesToDelete = currentVariables
      .filter(
        (variable) =>
          !updates.variables.find(
            (v) => v.id === variable.metrics_variables_table?.variable_id
          )
      )
      .map((v) => v.metrics_variables_table?.variable_id)
      .filter((v) => !!v) as number[];

    const variablesToAdd = updates.variables.filter((variable) => !variable.id);

    const del1 = await db
      .delete(metricsVariablesTable)
      .where(inArray(metricsVariablesTable.variable_id, variablesToDelete))
      .returning();

    const del2 = await db
      .delete(logsTable)
      .where(inArray(logsTable.id, variablesToDelete))
      .returning();

    const inserted = await db
      .insert(logsTable)
      .values(
        variablesToAdd.map((variable) => ({
          ...variable,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          protocol_id: protocol.id,
        }))
      )
      .returning();

    const inserted2 = await db
      .insert(metricsVariablesTable)
      .values(
        inserted.map((variable) => ({
          metric_id: Number(id),
          variable_id: variable.id,
        }))
      )
      .returning();

    if (!del1.length || !del2.length || !inserted.length || !inserted2.length) {
      console.error("Failed to update variables");

      return NextResponse.json(
        { error: "Failed to update the metric." },
        { status: 500 }
      );
    }

    // Update existing variables
    const updatedVariables = updates.variables.filter(
      (variable) => !!variable.id
    );

    const updatedVariablesRet = await Promise.all(
      updatedVariables
        .filter((v) => !!v.id)
        .map(async (variable) => {
          const updatedVariable = await db
            .update(logsTable)
            .set(variable)
            .where(eq(logsTable.id, variable.id!))
            .returning();
          return updatedVariable[0];
        })
    );

    // If variables updated
    if (
      del1.length ||
      del2.length ||
      inserted.length ||
      inserted2.length ||
      updatedVariablesRet.length
    ) {
      filteredUpdates.last_value = undefined;
      filteredUpdates.last_calculated = undefined;
    }

    const updatedMetric = await db
      .update(metricsTable)
      .set(filteredUpdates)
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
    return NextResponse.json({}, { status: 200 });
  } catch (error) {
    console.error("Failed to delete metric:", error);
    return NextResponse.json(
      { error: "Failed to delete the metric." },
      { status: 500 }
    );
  }
}

export async function GET(
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

  const metric = await db
    .select()
    .from(metricsTable)
    .where(eq(metricsTable.id, Number(id)));

  if (metric.length === 0) {
    return NextResponse.json({ error: "Metric not found." }, { status: 404 });
  }

  if (metric[0].protocol_id !== protocol.id) {
    return NextResponse.json(
      { error: "Metric not found for the user." },
      { status: 404 }
    );
  }

  // Add variables
  const variables = await db
    .select()
    .from(logsTable)
    .fullJoin(
      metricsVariablesTable,
      eq(logsTable.id, metricsVariablesTable.variable_id)
    )
    .where(eq(metricsVariablesTable.metric_id, Number(id)));

  return NextResponse.json(
    SuperJSON.serialize({
      metric: metric[0],
      variables: variables.map((variable) => variable.logs_table),
    }).json,
    { status: 200 }
  );
}
